/**
 * Shared TypeScript types for ChHeader extension
 */

/** Chrome resource types supported by this extension. `document` is retained to read old profiles. */
export const RESOURCE_TYPES = [
  'main_frame',
  'sub_frame',
  'stylesheet',
  'script',
  'image',
  'font',
  'object',
  'xmlhttprequest',
  'ping',
  'csp_report',
  'media',
  'websocket',
  'webtransport',
  'webbundle',
  'other',
  'document',
] as const

export type ResourceType = (typeof RESOURCE_TYPES)[number]

export function isResourceType(value: string): value is ResourceType {
  return (RESOURCE_TYPES as readonly string[]).includes(value)
}

export interface Matcher {
  id: string
  urlFilter: string
  resourceTypes?: ResourceType[]
}

export interface HeaderOp {
  id: string
  header: string
  value: string
  enabled?: boolean
}

export interface Profile {
  id: string
  name: string
  color: string
  initials?: string
  notes?: string
  enabled: boolean
  /** HTTP/HTTPS destinations, including subdomains; never a wildcard all-host grant. */
  accessSites?: string[]
  matchers: Matcher[]
  requestHeaders: HeaderOp[]
  responseHeaders: HeaderOp[]
}

export const STORAGE_KEYS = {
  PROFILES: 'profiles',
  ACTIVE_PROFILE_ID: 'activeProfileId',
} as const

export interface ExtensionStorage {
  profiles: Profile[]
  activeProfileId: string | null
}

export interface State {
  profiles: Profile[]
  activeId: string | null
  filtered: Profile[]
  current: Profile | null
}
