/**
 * DNR (Declarative Net Request) rule building for ChHeader extension
 */

import type { Profile, HeaderOp } from './types'

/**
 * Generate deterministic numeric IDs for DNR rules from profile/matcher/header ids
 * Uses FNV-1a hash function which has better distribution than simple hashing
 */
export function hashToInt(s: string): number {
  // FNV-1a 32-bit hash
  let hash = 0x811c9dc5 // FNV offset basis

  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i)
    hash = hash ^ char // XOR the byte
    hash = (hash * 0x01000193) >>> 0 // Multiply by FNV prime and keep 32-bit
  }

  // DNR rule IDs must be in range [1, 2147483647]
  // Use modulo to fit in signed 32-bit range
  return (Math.abs(hash) % 2147483646) + 1
}

/**
 * Default resource types for DNR rules
 * Valid types per Chrome: csp_report, font, image, main_frame, media, object, other, ping, script, stylesheet, sub_frame, webbundle, websocket, webtransport, xmlhttprequest
 */
const DEFAULT_RESOURCE_TYPES = [
  'main_frame',
  'sub_frame',
  'xmlhttprequest',
  'script',
  'image',
  'stylesheet',
  'object',
  'ping',
  'other',
] as const

/**
 * Convert headers to DNR ModifyHeaderInfo
 * Headers use an upsert operation: set if missing, replace if exists
 * Only includes headers that are enabled (enabled !== false) and have non-empty names
 */
function buildHeaderModifications(
  headers: HeaderOp[]
): chrome.declarativeNetRequest.ModifyHeaderInfo[] {
  return headers
    .filter((h) => h.enabled !== false && h.header && h.header.trim())
    .map((h) => ({
      header: h.header,
      operation: 'set' as const,
      value: h.value,
    }))
}

/**
 * Build a modify headers action
 * Only include request/response headers if they have content (Chrome doesn't allow empty arrays)
 */
function buildModifyHeadersAction(
  requestHeaders: chrome.declarativeNetRequest.ModifyHeaderInfo[],
  responseHeaders: chrome.declarativeNetRequest.ModifyHeaderInfo[]
): chrome.declarativeNetRequest.RuleAction {
  const action: any = {
    type: 'modifyHeaders' as const,
  }

  if (requestHeaders.length > 0) {
    action.requestHeaders = requestHeaders
  }

  if (responseHeaders.length > 0) {
    action.responseHeaders = responseHeaders
  }

  return action as chrome.declarativeNetRequest.RuleAction
}

/**
 * Build DNR rules from a profile
 */
export function buildRulesFromProfile(
  profile: Profile | null
): chrome.declarativeNetRequest.Rule[] {
  if (!profile) return []

  const rules: chrome.declarativeNetRequest.Rule[] = []
  const matchers = profile.matchers?.length
    ? profile.matchers
    : [
        {
          id: '__all__',
          label: 'All sites',
          urlFilter: '*',
          resourceTypes: Array.from(DEFAULT_RESOURCE_TYPES),
        },
      ]

  const requestHeaders = buildHeaderModifications(profile.requestHeaders || [])
  const responseHeaders = buildHeaderModifications(profile.responseHeaders || [])

  // Only create rules if there are headers to modify
  if (!requestHeaders.length && !responseHeaders.length) {
    return []
  }

  // Deduplicate matchers by ID
  const seenMatcherIds = new Set<string>()
  const uniqueMatchers = []

  for (const m of matchers) {
    if (!seenMatcherIds.has(m.id)) {
      seenMatcherIds.add(m.id)
      uniqueMatchers.push(m)
    }
  }

  for (const m of uniqueMatchers) {
    const condition: chrome.declarativeNetRequest.RuleCondition = {
      urlFilter: m.urlFilter || '*',
      resourceTypes: (m.resourceTypes?.length
        ? m.resourceTypes
        : Array.from(DEFAULT_RESOURCE_TYPES)) as chrome.declarativeNetRequest.ResourceType[],
    }

    const action = buildModifyHeadersAction(requestHeaders, responseHeaders)

    const rule: chrome.declarativeNetRequest.Rule = {
      id: hashToInt(`${profile.id}:${m.id}:reqres`),
      priority: 1,
      action,
      condition,
    }
    rules.push(rule)
  }

  return rules
}

/**
 * Apply DNR rules to Chrome
 * Validates rules and clears old rules before applying new ones
 */
export async function applyDNRRules(rules: chrome.declarativeNetRequest.Rule[]): Promise<void> {
  // Deduplicate rules by ID (keep first occurrence)
  const seenIds = new Set<number>()
  const uniqueRules = rules.filter((rule) => {
    if (seenIds.has(rule.id)) {
      console.warn(`ChHeader: skipping duplicate rule ID ${rule.id}`)
      return false
    }
    seenIds.add(rule.id)
    return true
  })

  // Validate for duplicate rule IDs (should not happen after dedup)
  const ruleIds = uniqueRules.map((r) => r.id)
  const uniqueIds = new Set(ruleIds)

  if (uniqueIds.size !== ruleIds.length) {
    const duplicates = ruleIds.filter((id, idx) => ruleIds.indexOf(id) !== idx)
    throw new Error(`Duplicate rule IDs detected: ${[...new Set(duplicates)].join(', ')}`)
  }

  // Get and remove all existing dynamic rules
  const current = await chrome.declarativeNetRequest.getDynamicRules()
  const removeRuleIds = current.map((r) => r.id)

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules: uniqueRules,
    })

    console.log(
      `ChHeader: applied ${uniqueRules.length} DNR rule(s), removed ${removeRuleIds.length} old rule(s)`
    )
  } catch (error) {
    console.error('ChHeader: failed to apply DNR rules:', error)
    throw error
  }
}
