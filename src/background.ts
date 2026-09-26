/**
 * Background service worker for ChHeader extension
 *
 * Responsible for managing DNR rules based on active profile.
 */

import {
  APPLICATION_STATUS_KEY,
  type ApplicationStatus,
  isApplicationStatus,
} from './lib/application-status'
import { applyDNRRules, buildRulesFromProfile } from './lib/dnr-rules'
import { hasSiteAccess } from './lib/site-access'
import { getActiveProfile, initializeStorage } from './lib/storage'
import { type Profile, STORAGE_KEYS } from './lib/types'

/**
 * Apply active profile's DNR rules
 */
async function publishStatus(
  result: Omit<ApplicationStatus, 'updatedAt'>
): Promise<ApplicationStatus> {
  const stored = await chrome.storage.local.get(APPLICATION_STATUS_KEY)
  const previous = stored[APPLICATION_STATUS_KEY]
  const updatedAt = Math.max(Date.now(), isApplicationStatus(previous) ? previous.updatedAt + 1 : 0)
  const status: ApplicationStatus = { ...result, updatedAt }
  await chrome.storage.local.set({ [APPLICATION_STATUS_KEY]: status })
  const applied = status.state === 'applied' && (status.ruleCount ?? 0) > 0
  try {
    await chrome.action.setBadgeText({ text: applied ? 'ON' : status.rulesMayBeActive ? '!' : '' })
    await chrome.action.setBadgeBackgroundColor({
      color: status.rulesMayBeActive ? '#b42318' : '#167348',
    })
    await chrome.action.setTitle({
      title: applied
        ? `ChHeader: ${status.profileName ?? 'Profile'} — ${status.ruleCount} rule${status.ruleCount === 1 ? '' : 's'} applied`
        : (status.message ?? 'ChHeader: Off'),
    })
  } catch {
    // Toolbar presentation is not evidence that Chrome rejected accepted rules.
    console.error('ChHeader: could not update toolbar status')
  }
  return status
}

async function updateActiveProfile(): Promise<ApplicationStatus> {
  let result = await updateRules()
  if (result.state === 'off') {
    const stored = await chrome.storage.local.get(APPLICATION_STATUS_KEY)
    const value = stored[APPLICATION_STATUS_KEY]
    const previous = isApplicationStatus(value) ? value : undefined
    // Disabling profiles during recovery emits another storage event. Keep its
    // explanation available when that event runs and when the popup reopens.
    if (previous?.state === 'error' || previous?.state === 'missing-access') {
      result = previous.rulesMayBeActive
        ? {
            ...previous,
            ruleCount: 0,
            rulesMayBeActive: false,
            message:
              'Previous rules cleared. Check URL rules and headers before turning on a profile.',
          }
        : previous
    }
  }
  // Diagnostics storage/presentation failures must not stop accepted rules.
  return publishStatus(result)
}

async function updateRules(): Promise<Omit<ApplicationStatus, 'updatedAt'>> {
  let active: Profile | null = null
  try {
    active = await getActiveProfile()
    const identity = { profileId: active?.id ?? null, profileName: active?.name ?? null }
    if (active && !(await hasSiteAccess(active))) {
      await stopProfiles()
      const status: Omit<ApplicationStatus, 'updatedAt'> = {
        ...identity,
        state: 'missing-access',
        ruleCount: 0,
        message: 'Profile turned off. Approve this profile’s sites, then turn it on again.',
      }
      return status
    }
    const rules = buildRulesFromProfile(active)
    await applyDNRRules(rules)
    const status: Omit<ApplicationStatus, 'updatedAt'> = {
      ...identity,
      state: !active ? 'off' : rules.length ? 'applied' : 'empty',
      ruleCount: rules.length,
      ...(!active
        ? {}
        : rules.length
          ? {}
          : {
              message: active.matchers.length
                ? 'No rules applied. Add an enabled header.'
                : 'No rules applied. Add a URL rule.',
            }),
    }
    return status
  } catch {
    let cleared = false
    try {
      await stopProfiles()
      cleared = true
    } catch {
      // Never claim rules stopped if Chrome rejected the cleanup operation.
    }
    const status: Omit<ApplicationStatus, 'updatedAt'> = {
      state: 'error',
      profileId: active?.id ?? null,
      profileName: active?.name ?? null,
      ruleCount: cleared ? 0 : null,
      rulesMayBeActive: !cleared,
      message: cleared
        ? 'Profile turned off. Check URL rules and headers, then turn it on again.'
        : 'Rules could not be applied or cleared. Previous rules may still be active. Disable the extension to stop them.',
    }
    return status
  }
}

async function stopProfiles(): Promise<void> {
  await applyDNRRules([])
  const { profiles = [] } = await chrome.storage.local.get<{ profiles?: Profile[] }>('profiles')
  if (profiles.some((profile) => profile.enabled)) {
    await chrome.storage.local.set({
      profiles: profiles.map((profile) => ({ ...profile, enabled: false })),
    })
  }
}

// Serialize the entire read/build/replace operation. Install, storage events and
// Apply can otherwise read the same old rule IDs and race to insert duplicates.
let pendingApply: Promise<void> = Promise.resolve()
function applyActiveProfile(): Promise<ApplicationStatus> {
  const operation = pendingApply.then(updateActiveProfile)
  pendingApply = operation.then(
    () => {},
    () => {}
  )
  return operation
}

/**
 * Initialize extension on install
 */
function enqueue(operation: () => Promise<void>): Promise<void> {
  const result = pendingApply.then(operation)
  pendingApply = result.catch(() => {})
  return result
}

async function revokeSiteAccess(): Promise<void> {
  try {
    await stopProfiles()
  } catch {
    await publishStatus({
      state: 'error',
      profileId: null,
      profileName: null,
      ruleCount: null,
      rulesMayBeActive: true,
      message:
        'Rules could not be cleared. Previous rules may still be active. Disable the extension to stop them.',
    })
    throw new Error('Could not confirm rules were cleared')
  }
  await publishStatus({ state: 'off', profileId: null, profileName: null, ruleCount: 0 })
  const grants = await new Promise<chrome.permissions.Permissions>((resolve) =>
    chrome.permissions.getAll(resolve)
  )
  if (grants.origins?.length) {
    await new Promise<void>((resolve, reject) =>
      chrome.permissions.remove({ origins: grants.origins }, (removed) => {
        if (chrome.runtime.lastError || !removed)
          reject(new Error('Could not revoke website access'))
        else resolve()
      })
    )
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void enqueue(async () => {
    await initializeStorage()
    // Upgrades must not carry broad grants or live rules into the consent-based model.
    await revokeSiteAccess()
  }).catch((error) => console.error('ChHeader: permission reset failed', error))
})
chrome.runtime.onStartup.addListener(() => {
  void applyActiveProfile().catch(console.error)
})
chrome.permissions.onRemoved.addListener(() => {
  void applyActiveProfile().catch(console.error)
})

/**
 * Listen for storage changes and re-apply rules
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return
  if (changes[STORAGE_KEYS.PROFILES] || changes[STORAGE_KEYS.ACTIVE_PROFILE_ID]) {
    void applyActiveProfile().catch((error) =>
      console.error('ChHeader: profile update failed', error)
    )
  }
})

/**
 * Handle messages from popup
 */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'revokeSiteAccess') {
    void enqueue(revokeSiteAccess)
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }))
    return true
  }
  if (msg?.type === 'applyNow') {
    void applyActiveProfile()
      .then((status) =>
        sendResponse(
          status.state === 'error'
            ? { ok: false, error: status.message, status }
            : { ok: true, status }
        )
      )
      .catch(() => sendResponse({ ok: false, error: 'Could not confirm rule application.' }))
    return true // async
  }
})
