/**
 * Shared TypeScript types for ChHeader extension
 */

export interface Matcher {
  id: string
  urlFilter: string
  resourceTypes?: string[]
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
  activeProfileId: string
}

export interface State {
  profiles: Profile[]
  activeId: string | null
  filtered: Profile[]
  current: Profile | null
}
