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
  matchers: Matcher[]
  requestHeaders: HeaderOp[]
  responseHeaders: HeaderOp[]
}

export interface StorageKeys {
  PROFILES: 'profiles'
  ACTIVE_PROFILE_ID: 'activeProfileId'
}

export const STORAGE_KEYS: StorageKeys = {
  PROFILES: 'profiles',
  ACTIVE_PROFILE_ID: 'activeProfileId',
}

export interface State {
  profiles: Profile[]
  activeId: string | null
  filtered: Profile[]
  current: Profile | null
}
