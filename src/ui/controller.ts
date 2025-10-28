/**
 * PopupController - Centralized event handling and business logic
 * Extracts messy event handlers from popup.ts into a testable controller
 */

import { STORAGE_KEYS, Profile, State } from '../lib/types'

const K = STORAGE_KEYS

export class PopupController {
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
      color: '#6b4eff',
      enabled: false,
      notes: '',
      matchers: [{ id: crypto.randomUUID(), urlFilter: '*', resourceTypes: [] }],
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
    const p = this.state.current
    if (!p) return

    const arr = isRequest ? p.requestHeaders : p.responseHeaders
    arr.push({ id: crypto.randomUUID(), header: '', value: '' })
    this.callbacks.syncAndRender()
  }

  /**
   * Handle sort headers button click
   */
  onSortHeaders(isRequest: boolean): void {
    const p = this.state.current
    if (!p) return

    const key = isRequest ? 'requestHeaders' : 'responseHeaders'
    p[key] = p[key].sort((a, b) => a.header.localeCompare(b.header))
    this.callbacks.syncAndRender()
  }

  /**
   * Handle clear headers button click
   */
  onClearHeaders(isRequest: boolean): void {
    const p = this.state.current
    if (!p) return

    const key = isRequest ? 'requestHeaders' : 'responseHeaders'
    p[key] = []
    this.callbacks.syncAndRender()
  }

  /**
   * Handle remove header button click
   */
  onRemoveHeader(headerId: string, isRequest: boolean): void {
    const p = this.state.current
    if (!p) return

    const key = isRequest ? 'requestHeaders' : 'responseHeaders'
    p[key] = p[key].filter((x) => x.id !== headerId)
    this.callbacks.syncAndRender()
  }

  /**
   * Handle add matcher button click
   */
  onAddMatcher(): void {
    const p = this.state.current
    if (!p) return

    p.matchers.push({ id: crypto.randomUUID(), urlFilter: '*', resourceTypes: [] })
    this.callbacks.syncAndRender()
  }

  /**
   * Handle remove matcher button click
   */
  onRemoveMatcher(matcherId: string): void {
    const p = this.state.current
    if (!p) return

    p.matchers = p.matchers.filter((x) => x.id !== matcherId)
    this.callbacks.syncAndRender()
  }

  /**
   * Handle duplicate profile button click
   */
  onDuplicateProfile(): void {
    const src = this.state.current
    if (!src) return

    const copy = JSON.parse(JSON.stringify(src)) as Profile
    copy.id = crypto.randomUUID()
    copy.name = `${src.name} (copy)`
    copy.enabled = false
    copy.matchers = copy.matchers.map((m) => ({ ...m, id: crypto.randomUUID() }))
    copy.requestHeaders = copy.requestHeaders.map((h) => ({ ...h, id: crypto.randomUUID() }))
    copy.responseHeaders = copy.responseHeaders.map((h) => ({ ...h, id: crypto.randomUUID() }))

    this.state.profiles.unshift(copy)
    this.callbacks.syncAndRender()
    this.callbacks.select(copy.id)
  }

  /**
   * Handle delete profile button click
   */
  onDeleteProfile(): void {
    if (!this.state.current) return

    const id = this.state.current.id
    this.state.profiles = this.state.profiles.filter((p) => p.id !== id)

    if (this.state.activeId === id) {
      this.state.activeId = this.state.profiles[0]?.id ?? null
      chrome.storage.local.set({ [K.ACTIVE_PROFILE_ID]: this.state.activeId })
    }

    this.callbacks.syncAndRender()
    this.callbacks.select(this.state.activeId)
  }

  /**
   * Handle apply/submit button click
   */
  async onApply(): Promise<void> {
    try {
      await chrome.runtime.sendMessage({ type: 'applyNow' })
    } catch (err) {
      console.error('Failed to apply profile:', err)
    }
  }

  /**
   * Handle profile name input change
   */
  onProfileNameChange(value: string): void {
    const p = this.state.current
    if (!p) return

    p.name = value
    this.callbacks.syncAndRender()
  }

  /**
   * Handle profile color input change
   */
  onProfileColorChange(value: string): void {
    const p = this.state.current
    if (!p) return

    p.color = value
    this.callbacks.syncAndRender()
  }

  /**
   * Handle profile notes textarea change
   */
  onProfileNotesChange(value: string): void {
    const p = this.state.current
    if (!p) return

    p.notes = value
    this.callbacks.syncAndRender()
  }

  /**
   * Handle profile enabled checkbox change
   */
  onProfileEnabledChange(checked: boolean): void {
    const p = this.state.current
    if (!p) return

    p.enabled = checked
    this.setActiveProfile(p.id, checked)
  }

  /**
   * Handle matcher field change
   */
  onMatcherChange(matcherId: string, field: 'urlFilter' | 'types', value: string): void {
    const p = this.state.current
    if (!p) return

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
    const p = this.state.current
    if (!p) return

    const arr = isRequest ? p.requestHeaders : p.responseHeaders
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
    const p = this.state.current
    if (!p) return

    try {
      const headers = Array.isArray(data) ? data : [data]
      const importedHeaders = headers.filter(
        (h) => h && typeof h === 'object' && 'header' in h && 'value' in h
      )

      if (importedHeaders.length === 0) {
        alert('No valid headers found in the imported file.')
        return
      }

      // Add imported headers to request headers
      p.requestHeaders.push(
        ...importedHeaders.map((h: any) => ({
          id: crypto.randomUUID(),
          header: h.header || '',
          value: h.value || '',
          enabled: h.enabled !== false,
        }))
      )

      this.callbacks.syncAndRender()
      alert(`Imported ${importedHeaders.length} header(s).`)
    } catch (err) {
      console.error('Failed to import headers:', err)
      alert('Failed to import headers. Make sure the JSON is valid.')
    }
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
        color: typeof profileData.color === 'string' ? profileData.color : '#6b4eff',
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

  private validateMatchers(
    data: unknown
  ): Array<{ id: string; urlFilter: string; resourceTypes?: string[] }> {
    if (!Array.isArray(data)) return []
    return data
      .filter((m) => m && typeof m === 'object' && 'urlFilter' in m)
      .map((m: any) => ({
        id: crypto.randomUUID(),
        urlFilter: m.urlFilter || '*',
        resourceTypes: Array.isArray(m.resourceTypes) ? m.resourceTypes : [],
      }))
  }

  private validateHeaders(
    data: unknown
  ): Array<{ id: string; header: string; value: string; enabled?: boolean }> {
    if (!Array.isArray(data)) return []
    return data
      .filter((h) => h && typeof h === 'object' && 'header' in h)
      .map((h: any) => ({
        id: crypto.randomUUID(),
        header: h.header || '',
        value: h.value || '',
        enabled: h.enabled !== false,
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
