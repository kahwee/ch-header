/**
 * Background service worker for ChHeader extension
 *
 * Responsible for managing DNR rules based on active profile.
 */

import { hasSiteAccess } from './lib/site-access'
import { applyDNRRules, buildRulesFromProfile } from './lib/dnr-rules'
import { getActiveProfile, initializeStorage } from './lib/storage'
import { STORAGE_KEYS, type Profile } from './lib/types'

/**
 * Apply active profile's DNR rules
 */
async function updateActiveProfile(): Promise<void> {
  const active = await getActiveProfile()
  try {
    if (active && !(await hasSiteAccess(active))) {
      await stopProfiles()
      return
    }
    await applyDNRRules(buildRulesFromProfile(active))
  } catch (error) {
    // Chrome rejects rule replacements atomically, leaving the previous rules live.
    // A failed edit or profile switch must not keep sending the previous headers.
    await stopProfiles()
    throw error
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
function applyActiveProfile(): Promise<void> {
  const operation = pendingApply.then(updateActiveProfile)
  pendingApply = operation.catch(() => {})
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
  await stopProfiles()
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
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true // async
  }
})
