/**
 * Background service worker for ChHeader extension
 *
 * Responsible for managing DNR rules based on active profile.
 */

import { applyDNRRules, buildRulesFromProfile } from './lib/dnr-rules'
import { getActiveProfile, initializeStorage } from './lib/storage'
import { STORAGE_KEYS } from './lib/types'

/**
 * Apply active profile's DNR rules
 */
async function updateActiveProfile(): Promise<void> {
  const active = await getActiveProfile()
  const rules = buildRulesFromProfile(active)
  await applyDNRRules(rules)

  console.log('ChHeader: applied profile', active?.name)
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
chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage()
  await applyActiveProfile()
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
  if (msg?.type === 'applyNow') {
    void applyActiveProfile()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true // async
  }
})
