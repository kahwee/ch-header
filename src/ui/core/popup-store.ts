import { type ExtensionStorage, type Profile, STORAGE_KEYS } from '../../lib/types'

export interface PopupSnapshot {
  activeProfileId: string | null
  profiles: Profile[]
}

/** Owns popup persistence and serializes writes so older edits cannot finish last. */
export class PopupStore {
  private pendingWrite: Promise<void> | null = null

  async load(): Promise<PopupSnapshot> {
    const data = await chrome.storage.local.get<Partial<ExtensionStorage>>([
      STORAGE_KEYS.PROFILES,
      STORAGE_KEYS.ACTIVE_PROFILE_ID,
    ])
    const profiles = data[STORAGE_KEYS.PROFILES] ?? []
    return {
      profiles,
      activeProfileId: data[STORAGE_KEYS.ACTIVE_PROFILE_ID] ?? profiles[0]?.id ?? null,
    }
  }

  save(profiles: Profile[], activeProfileId?: string | null): Promise<void> {
    const values: Partial<ExtensionStorage> = {
      [STORAGE_KEYS.PROFILES]: structuredClone(profiles),
      ...(activeProfileId !== undefined
        ? { [STORAGE_KEYS.ACTIVE_PROFILE_ID]: activeProfileId }
        : {}),
    }
    const write = () => chrome.storage.local.set(values)
    const operation = this.pendingWrite ? this.pendingWrite.then(write) : write()
    const continuation = operation.catch(() => {})
    this.pendingWrite = continuation
    void continuation.then(() => {
      if (this.pendingWrite === continuation) this.pendingWrite = null
    })
    return operation
  }

  flush(): Promise<void> {
    return this.pendingWrite ?? Promise.resolve()
  }
}
