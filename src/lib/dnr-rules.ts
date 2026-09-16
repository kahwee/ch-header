/**
 * DNR (Declarative Net Request) rule building for ChHeader extension
 */

import { parseAccessSites } from './site-access'
import type { HeaderOp, Profile, ResourceType } from './types'
import { validateRegexFilter } from './url-rule'

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
    hash = Math.imul(hash, 0x01000193) >>> 0 // Multiply by FNV prime and keep 32-bit
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
  'font',
  'media',
  'csp_report',
  'websocket',
  'webtransport',
  'webbundle',
  'object',
  'ping',
  'other',
] as const

const MAX_DYNAMIC_RULE_ID = 2_147_483_647

/**
 * Preserve deterministic IDs while ensuring each matcher gets a rule. A hash
 * collision must not silently drop a user's header rule.
 */
function nextAvailableRuleId(key: string, usedIds: Set<number>): number {
  let id = hashToInt(key)
  while (usedIds.has(id)) id = id === MAX_DYNAMIC_RULE_ID ? 1 : id + 1
  usedIds.add(id)
  return id
}

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
  const action: chrome.declarativeNetRequest.RuleAction = {
    type: 'modifyHeaders' as const,
    ...(requestHeaders.length > 0 ? { requestHeaders } : {}),
    ...(responseHeaders.length > 0 ? { responseHeaders } : {}),
  }
  return action
}

/**
 * Build DNR rules from a profile
 */
export function buildRulesFromProfile(
  profile: Profile | null
): chrome.declarativeNetRequest.Rule[] {
  if (!profile?.accessSites?.length) return []
  const requestDomains = parseAccessSites(profile.accessSites.join(' '))
  if (!requestDomains.length) return []

  const rules: chrome.declarativeNetRequest.Rule[] = []
  const usedRuleIds = new Set<number>()
  // No URL rules means no destinations. Removing the last rule must not widen scope.
  const matchers = profile.matchers || []

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
      ...(m.urlFilter?.startsWith('regex:')
        ? { regexFilter: m.urlFilter.slice(6) }
        : { urlFilter: m.urlFilter || '*' }),
      requestDomains,
      resourceTypes: (m.resourceTypes?.length
        ? m.resourceTypes
        : Array.from(DEFAULT_RESOURCE_TYPES)
      ).map((type: ResourceType) =>
        type === 'document' ? 'main_frame' : type
      ) as chrome.declarativeNetRequest.ResourceType[],
    }

    const action = buildModifyHeadersAction(requestHeaders, responseHeaders)

    const rule: chrome.declarativeNetRequest.Rule = {
      id: nextAvailableRuleId(`${profile.id}:${m.id}:reqres`, usedRuleIds),
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
  // Reject duplicate IDs rather than silently dropping one of the user's rules.
  const ruleIds = rules.map((r) => r.id)
  const uniqueIds = new Set(ruleIds)

  if (uniqueIds.size !== ruleIds.length) {
    const duplicates = ruleIds.filter((id, idx) => ruleIds.indexOf(id) !== idx)
    throw new Error(`Duplicate rule IDs detected: ${[...new Set(duplicates)].join(', ')}`)
  }

  // Validate before touching live rules, including profiles arriving via imports/storage.
  for (const rule of rules) {
    if (rule.condition.regexFilter !== undefined) {
      await validateRegexFilter(`regex:${rule.condition.regexFilter}`)
    }
  }

  // Get and remove all existing dynamic rules
  const current = await chrome.declarativeNetRequest.getDynamicRules()
  const removeRuleIds = current.map((r) => r.id)

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules: rules,
    })

    console.log(
      `ChHeader: applied ${rules.length} DNR rule(s), removed ${removeRuleIds.length} old rule(s)`
    )
  } catch (error) {
    console.error('ChHeader: failed to apply DNR rules:', error)
    throw error
  }
}
