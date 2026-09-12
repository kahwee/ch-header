/**
 * Storage management for ChHeader extension
 */

import type { ExtensionStorage, Profile } from './types'
import { STORAGE_KEYS } from './types'

export async function getProfiles(): Promise<Profile[]> {
  const data = await chrome.storage.local.get<Partial<ExtensionStorage>>(STORAGE_KEYS.PROFILES)
  return data[STORAGE_KEYS.PROFILES] || []
}

export async function getActiveProfileId(): Promise<string | null> {
  const data = await chrome.storage.local.get<Partial<ExtensionStorage>>(
    STORAGE_KEYS.ACTIVE_PROFILE_ID
  )
  return data[STORAGE_KEYS.ACTIVE_PROFILE_ID] || null
}

export async function getActiveProfile(): Promise<Profile | null> {
  const [profiles, activeId] = await Promise.all([getProfiles(), getActiveProfileId()])
  return profiles.find((p) => p.id === activeId && p.enabled) || null
}

export async function saveProfiles(profiles: Profile[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.PROFILES]: profiles })
}

export async function setActiveProfile(id: string): Promise<void> {
  const profiles = await getProfiles()
  const updated = profiles.map((p) => ({
    ...p,
    enabled: p.id === id,
  }))
  await Promise.all([
    saveProfiles(updated),
    chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_PROFILE_ID]: id }),
  ])
}

export async function deleteProfile(id: string): Promise<void> {
  const profiles = await getProfiles()
  const filtered = profiles.filter((p) => p.id !== id)
  const activeId = await getActiveProfileId()

  await saveProfiles(filtered)

  if (activeId === id && filtered.length > 0) {
    await setActiveProfile(filtered[0].id)
  }
}

export async function initializeStorage(): Promise<void> {
  const data = await chrome.storage.local.get<Partial<ExtensionStorage>>(STORAGE_KEYS.PROFILES)
  // An intentionally empty library stays empty on updates. Never enable demo rules.
  if (data[STORAGE_KEYS.PROFILES] === undefined) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.PROFILES]: [],
      [STORAGE_KEYS.ACTIVE_PROFILE_ID]: null,
    })
  }
}
