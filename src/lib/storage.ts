/**
 * Storage management for ChHeader extension
 */

import type { Profile } from './types'
import { STORAGE_KEYS } from './types'

export async function getProfiles(): Promise<Profile[]> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.PROFILES)
  return data[STORAGE_KEYS.PROFILES] || []
}

export async function getActiveProfileId(): Promise<string | null> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_PROFILE_ID)
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
    enabled: p.id === id ? true : false,
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
  const profiles = await getProfiles()
  if (profiles.length === 0) {
    const sample: Profile = {
      id: crypto.randomUUID(),
      name: 'Sample: Staging APIs',
      color: '#6b4eff',
      enabled: false,
      notes: 'Adds X-Env: staging to example.com',
      matchers: [{ id: crypto.randomUUID(), urlFilter: 'example.com' }],
      requestHeaders: [{ id: crypto.randomUUID(), header: 'X-Env', value: 'staging' }],
      responseHeaders: [],
    }
    await saveProfiles([sample])
    await setActiveProfile(sample.id)
  }
}
