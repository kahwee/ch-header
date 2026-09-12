/**
 * PopupController - Centralized event handling and business logic
 * Extracts messy event handlers from popup.ts into a testable controller
 */

import { type Profile, STORAGE_KEYS, type State } from '../../lib/types'

const K = STORAGE_KEYS

export class PopupController {
  private deleted: { profile: Profile; index: number } | null = null

  constructor(
    private state: State,
    private callbacks: {
      renderList: () => void
      renderHeaders: () => void
      renderMatchers: () => void
      select: (id: string | null) => void
      saveProfiles: () => void
      syncAndRender: (opts?: { listOnly?: boolean }) => void
    }
  ) {}

  /**
   * Guard utility: ensures current profile exists before executing callback
   * Returns silently if no current profile
   */
  private withCurrentProfile<T>(cb: (p: Profile) => T): T | undefined {
    const p = this.state.current
    if (!p) return
    return cb(p)
  }

  /**
   * Get the appropriate header array (request or response)
   */
  private getHeaderArray(isRequest: boolean): Profile['requestHeaders'] {
    const p = this.state.current!
    return isRequest ? p.requestHeaders : p.responseHeaders
  }

  /**
   * Handle profile list item click
   */
  onProfileItemClick(id: string): void {
    this.callbacks.select(id)
  }

  /**
   * Handle "New Profile" button click
   */
  onNewProfile(): void {
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name: 'New profile',
      color: 'blue',
      enabled: false,
      notes: '',
      matchers: [{ id: crypto.randomUUID(), urlFilter: '||example.invalid^', resourceTypes: [] }],
      requestHeaders: [],
      responseHeaders: [],
    }
    this.state.profiles.unshift(newProfile)
    this.callbacks.syncAndRender()
    this.callbacks.select(newProfile.id)
  }

  /**
   * Handle add header button click
   */
  onAddHeader(isRequest: boolean): void {
    this.withCurrentProfile(() => {
      const arr = this.getHeaderArray(isRequest)
      arr.push({ id: crypto.randomUUID(), header: '', value: '' })
      this.callbacks.syncAndRender()
    })
  }

  /**
   * Handle sort headers button click
   */
  onSortHeaders(isRequest: boolean): void {
    this.withCurrentProfile(() => {
      const arr = this.getHeaderArray(isRequest)
      arr.sort((a, b) => a.header.localeCompare(b.header))
      this.callbacks.syncAndRender()
    })
  }

  /**
   * Handle clear headers button click
   */
  onClearHeaders(isRequest: boolean): void {
    this.withCurrentProfile((p) => {
      const key = isRequest ? 'requestHeaders' : 'responseHeaders'
      p[key] = []
      this.callbacks.syncAndRender()
    })
  }

  /**
   * Handle remove header button click
   */
  onRemoveHeader(headerId: string, isRequest: boolean): void {
    this.withCurrentProfile(() => {
      const arr = this.getHeaderArray(isRequest)
      const idx = arr.findIndex((x) => x.id === headerId)
      if (idx !== -1) {
        arr.splice(idx, 1)
        this.callbacks.syncAndRender()
      }
    })
  }

  /**
   * Handle add matcher button click
   */
  onAddMatcher(): void {
    this.withCurrentProfile((p) => {
      p.matchers.push({
        id: crypto.randomUUID(),
        urlFilter: '||example.invalid^',
        resourceTypes: [],
      })
      this.callbacks.syncAndRender()
    })
  }

  /**
   * Handle remove matcher button click
   */
  onRemoveMatcher(matcherId: string): void {
    this.withCurrentProfile((p) => {
      const idx = p.matchers.findIndex((x) => x.id === matcherId)
      if (idx !== -1) {
        p.matchers.splice(idx, 1)
        this.callbacks.syncAndRender()
      }
    })
  }

  /**
   * Handle duplicate profile button click
   */
  onDuplicateProfile(id = this.state.current?.id): void {
    const src = this.state.profiles.find((p) => p.id === id)
    if (!src) return
    const copy = this.deepCloneProfile(src)
    copy.name = `${src.name} (copy)`
    this.state.profiles.unshift(copy)
    this.callbacks.syncAndRender()
    this.callbacks.select(copy.id)
  }

  onDeleteProfile(id = this.state.current?.id): boolean {
    const index = this.state.profiles.findIndex((p) => p.id === id)
    if (index < 0) return false
    this.deleted = { profile: this.state.profiles[index], index }
    this.state.profiles.splice(index, 1)
    if (this.state.activeId === id) {
      this.state.activeId = null
      chrome.storage.local.set({ [K.ACTIVE_PROFILE_ID]: null })
    }
    if (this.state.current?.id === id)
      this.state.current = this.state.profiles[index] ?? this.state.profiles[index - 1] ?? null
    this.callbacks.syncAndRender()
    return true
  }

  onUndoDeleteProfile(): void {
    if (!this.deleted) return
    const { profile, index } = this.deleted
    profile.enabled = false
    this.state.profiles.splice(index, 0, profile)
    this.deleted = null
    this.callbacks.syncAndRender()
    this.callbacks.select(profile.id)
  }

  onImportProfiles(profiles: Profile[]): void {
    this.state.profiles.unshift(...profiles.map((p) => ({ ...p, enabled: false })))
    this.callbacks.syncAndRender()
    this.callbacks.select(profiles[0]?.id ?? null)
  }

  onSetProfileEnabled(id: string, enabled: boolean): void {
    if (this.state.profiles.some((p) => p.id === id)) this.setActiveProfile(id, enabled)
  }

  /**
   * Handle apply/submit button click
   */
  async onApply(): Promise<string | null> {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'applyNow' })
      if (response?.ok === false)
        return 'Could not apply rules. Last applied rules remain active. Check your URL rules and headers.'
      return null
    } catch (err) {
      console.error('Failed to apply profile:', err)
      return 'Could not reach Chrome to apply rules. Try reopening the popup.'
    }
  }

  /**
   * Handle profile name input change
   */
  onProfileNameChange(value: string): void {
    this.withCurrentProfile((p) => {
      p.name = value
      this.callbacks.syncAndRender({ listOnly: true })
    })
  }

  /**
   * Handle profile color input change
   */
  onProfileColorChange(value: string): void {
    this.withCurrentProfile((p) => {
      p.color = value
      this.callbacks.syncAndRender({ listOnly: true })
    })
  }

  /**
   * Handle profile notes textarea change
   */
  onProfileNotesChange(value: string): void {
    this.withCurrentProfile((p) => {
      p.notes = value
      this.callbacks.syncAndRender({ listOnly: true })
    })
  }

  /**
   * Handle profile enabled checkbox change
   */
  onProfileEnabledChange(checked: boolean): void {
    this.withCurrentProfile((p) => {
      p.enabled = checked
      this.setActiveProfile(p.id, checked)
    })
  }

  /**
   * Handle matcher field change
   */
  onMatcherChange(matcherId: string, field: 'urlFilter' | 'types', value: string): void {
    this.withCurrentProfile((p) => {
      const m = p.matchers.find((x) => x.id === matcherId)
      if (!m) return

      if (field === 'urlFilter') {
        // Empty URL filter matches all domains
        m.urlFilter = value || '*'
      } else if (field === 'types') {
        // Empty resource types means all request types
        if (!value) {
          m.resourceTypes = []
        } else {
          m.resourceTypes = [value]
        }
      }

      this.callbacks.syncAndRender({ listOnly: true })
    })
  }

  /**
   * Handle header field change
   */
  onHeaderChange(
    headerId: string,
    isRequest: boolean,
    field: 'header' | 'value' | 'enabled',
    value: string | boolean
  ): void {
    this.withCurrentProfile(() => {
      const arr = this.getHeaderArray(isRequest)
      const h = arr.find((x) => x.id === headerId)
      if (!h) return

      if (field === 'header') {
        h.header = value as string
      } else if (field === 'value') {
        h.value = value as string
      } else if (field === 'enabled') {
        h.enabled = value as boolean
      }

      this.callbacks.syncAndRender({ listOnly: true })
    })
  }

  /**
   * Handle search input change
   */
  onSearchChange(query: string): void {
    this.state.filtered = this.state.profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.notes || '').toLowerCase().includes(query.toLowerCase())
    )
    this.callbacks.renderList()
  }

  /**
   * Import headers from JSON
   */
  onImportHeaders(data: unknown): void {
    this.withCurrentProfile((p) => {
      try {
        const headers = Array.isArray(data) ? data : [data]
        const importedHeaders = headers.filter(
          (header): header is Record<string, unknown> =>
            !!header && typeof header === 'object' && 'header' in header && 'value' in header
        )

        if (importedHeaders.length === 0) {
          alert('No valid headers found in the imported file.')
          return
        }

        // Add imported headers to request headers
        p.requestHeaders.push(
          ...importedHeaders.map((h) => ({
            id: crypto.randomUUID(),
            header: typeof h.header === 'string' ? h.header : '',
            value: typeof h.value === 'string' ? h.value : '',
            enabled: h.enabled !== false,
          }))
        )

        this.callbacks.syncAndRender()
        alert(`Imported ${importedHeaders.length} header(s).`)
      } catch (err) {
        console.error('Failed to import headers:', err)
        alert('Failed to import headers. Make sure the JSON is valid.')
      }
    })
  }

  /**
   * Import entire profile from JSON
   */
  onImportProfile(data: unknown): void {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid profile data')
      }

      const profileData = data as Record<string, unknown>
      const newProfile: Profile = {
        id: crypto.randomUUID(),
        name: typeof profileData.name === 'string' ? profileData.name : 'Imported profile',
        color: typeof profileData.color === 'string' ? profileData.color : 'blue',
        enabled: false,
        notes: typeof profileData.notes === 'string' ? profileData.notes : '',
        matchers: this.validateMatchers(profileData.matchers),
        requestHeaders: this.validateHeaders(profileData.requestHeaders),
        responseHeaders: this.validateHeaders(profileData.responseHeaders),
      }

      this.state.profiles.unshift(newProfile)
      this.callbacks.syncAndRender()
      this.callbacks.select(newProfile.id)
      alert('Profile imported successfully!')
    } catch (err) {
      console.error('Failed to import profile:', err)
      alert('Failed to import profile. Make sure the JSON is valid and contains required fields.')
    }
  }

  /**
   * Deep clone a profile with new IDs for all nested items
   */
  private deepCloneProfile(src: Profile): Profile {
    return {
      id: crypto.randomUUID(),
      name: src.name,
      color: src.color,
      notes: src.notes,
      initials: src.initials,
      enabled: false, // Always disabled by default
      matchers: src.matchers.map((m) => ({ ...m, id: crypto.randomUUID() })),
      requestHeaders: src.requestHeaders.map((h) => ({ ...h, id: crypto.randomUUID() })),
      responseHeaders: src.responseHeaders.map((h) => ({ ...h, id: crypto.randomUUID() })),
    }
  }

  /**
   * Generic validation for arrays of items with ID generation
   */
  private validateItems<T extends { id?: unknown }>(
    data: unknown,
    requiredField: string,
    transform: (item: Record<string, unknown>) => Omit<T, 'id'>
  ): Array<T & { id: string }> {
    if (!Array.isArray(data)) return []

    return data
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object' && requiredField in item
      )
      .map((item) => ({ id: crypto.randomUUID(), ...transform(item) }) as T & { id: string })
  }

  private validateMatchers(
    data: unknown
  ): Array<{ id: string; urlFilter: string; resourceTypes?: string[] }> {
    return this.validateItems(data, 'urlFilter', (matcher) => ({
      urlFilter: typeof matcher.urlFilter === 'string' ? matcher.urlFilter : '*',
      resourceTypes: Array.isArray(matcher.resourceTypes)
        ? matcher.resourceTypes.filter((type): type is string => typeof type === 'string')
        : [],
    }))
  }

  private validateHeaders(
    data: unknown
  ): Array<{ id: string; header: string; value: string; enabled?: boolean }> {
    return this.validateItems(data, 'header', (header) => ({
      header: typeof header.header === 'string' ? header.header : '',
      value: typeof header.value === 'string' ? header.value : '',
      enabled: header.enabled !== false,
    }))
  }

  /**
   * Set active profile (helper)
   */
  private setActiveProfile(id: string, enabled: boolean): void {
    this.state.activeId = id
    this.state.profiles = this.state.profiles.map((p) => ({
      ...p,
      enabled: p.id === id ? enabled : false,
    }))

    this.state.current = this.state.profiles.find((p) => p.id === this.state.current?.id) ?? null
    this.callbacks.renderList()
    this.callbacks.select(this.state.current?.id ?? null)
    chrome.storage.local.set(
      {
        [K.ACTIVE_PROFILE_ID]: id,
        [K.PROFILES]: this.state.profiles,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to save active profile:', chrome.runtime.lastError.message)
        }
      }
    )
  }
}
