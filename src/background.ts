/**
 * Background service worker for ChHeader extension
 *
 * Responsible for managing DNR rules based on active profile.
 */

import { getActiveProfile, initializeStorage } from './lib/storage'
import { buildRulesFromProfile, applyDNRRules } from './lib/dnr-rules'
import { STORAGE_KEYS } from './lib/types'

/**
 * Apply active profile's DNR rules
 */
async function applyActiveProfile(): Promise<void> {
  const active = await getActiveProfile()
  const rules = buildRulesFromProfile(active)
  await applyDNRRules(rules)

  console.log('ChHeader: applied profile', active?.name)
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
    applyActiveProfile()
  }
})

/**
 * Handle messages from popup
 */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'applyNow') {
    applyActiveProfile()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true // async
  }
})
