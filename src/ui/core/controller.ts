/** Mutates popup state through small, UI-independent commands. */

import { type HeaderOp, isResourceType, type Profile, type State } from '../../lib/types'

export interface CommitOptions {
  activeProfileId?: string | null
  listOnly?: boolean
}

export interface PopupControllerCallbacks {
  commit: (options?: CommitOptions) => void
  renderList: () => void
  select: (id: string | null) => void
}

export class PopupController {
  private deleted: { profile: Profile; index: number } | null = null

  constructor(
    private state: State,
    private callbacks: PopupControllerCallbacks
  ) {}

  private withCurrentProfile<T>(cb: (p: Profile) => T): T | undefined {
    const p = this.state.current
    if (!p) return
    return cb(p)
  }

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
    this.callbacks.commit()
    this.callbacks.select(newProfile.id)
  }

  /**
   * Handle add header button click
   */
  onAddHeader(isRequest: boolean): void {
    this.withCurrentProfile(() => {
      const arr = this.getHeaderArray(isRequest)
      arr.push({ id: crypto.randomUUID(), header: '', value: '' })
      this.callbacks.commit()
    })
  }

  /**
   * Handle sort headers button click
   */
  onSortHeaders(isRequest: boolean): void {
    this.withCurrentProfile(() => {
      const arr = this.getHeaderArray(isRequest)
      arr.sort((a, b) => a.header.localeCompare(b.header))
      this.callbacks.commit()
    })
  }

  /**
   * Handle clear headers button click
   */
  onClearHeaders(isRequest: boolean): void {
    this.withCurrentProfile((p) => {
      const key = isRequest ? 'requestHeaders' : 'responseHeaders'
      p[key] = []
      this.callbacks.commit()
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
        this.callbacks.commit()
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
      this.callbacks.commit()
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
        this.callbacks.commit()
      }
    })
  }

  onSortMatchers(): void {
    this.withCurrentProfile((profile) => {
      profile.matchers.sort((a, b) => a.urlFilter.localeCompare(b.urlFilter))
      this.callbacks.commit()
    })
  }

  onClearMatchers(): void {
    this.withCurrentProfile((profile) => {
      profile.matchers = []
      this.callbacks.commit()
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
    this.callbacks.commit()
    this.callbacks.select(copy.id)
  }

  onDeleteProfile(id = this.state.current?.id): boolean {
    const index = this.state.profiles.findIndex((p) => p.id === id)
    if (index < 0) return false
    this.deleted = { profile: this.state.profiles[index], index }
    this.state.profiles.splice(index, 1)
    if (this.state.activeId === id) {
      this.state.activeId = null
    }
    if (this.state.current?.id === id)
      this.state.current = this.state.profiles[index] ?? this.state.profiles[index - 1] ?? null
    this.callbacks.commit({ ...(this.state.activeId === null ? { activeProfileId: null } : {}) })
    return true
  }

  onUndoDeleteProfile(): void {
    if (!this.deleted) return
    const { profile, index } = this.deleted
    profile.enabled = false
    this.state.profiles.splice(index, 0, profile)
    this.deleted = null
    this.callbacks.commit()
    this.callbacks.select(profile.id)
  }

  onImportProfiles(profiles: Profile[]): void {
    this.state.profiles.unshift(...profiles.map((p) => ({ ...p, enabled: false })))
    this.callbacks.commit()
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
        return (
          response.status?.message ?? 'Could not apply rules. Check application status and retry.'
        )
      if (response?.ok !== true)
        return 'Chrome did not confirm application. Try reopening the popup.'
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
      this.callbacks.commit({ listOnly: true })
    })
  }

  /**
   * Handle profile color input change
   */
  onProfileColorChange(value: string): void {
    this.withCurrentProfile((p) => {
      p.color = value
      this.callbacks.commit({ listOnly: true })
    })
  }

  /**
   * Handle profile notes textarea change
   */
  onProfileNotesChange(value: string): void {
    this.withCurrentProfile((p) => {
      p.notes = value
      this.callbacks.commit({ listOnly: true })
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
          if (isResourceType(value)) m.resourceTypes = [value]
        }
      }

      this.callbacks.commit({ listOnly: true })
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

      this.callbacks.commit({ listOnly: true })
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
  onImportHeaders(headers: HeaderOp[]): void {
    this.withCurrentProfile((p) => {
      p.requestHeaders.push(...headers)
      this.callbacks.commit()
    })
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
      accessSites: src.accessSites?.slice(),
      enabled: false, // Always disabled by default
      matchers: src.matchers.map((m) => ({ ...m, id: crypto.randomUUID() })),
      requestHeaders: src.requestHeaders.map((h) => ({ ...h, id: crypto.randomUUID() })),
      responseHeaders: src.responseHeaders.map((h) => ({ ...h, id: crypto.randomUUID() })),
    }
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
    this.callbacks.commit({ activeProfileId: id })
  }
}
