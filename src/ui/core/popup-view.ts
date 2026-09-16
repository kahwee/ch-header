import { suggestedAccessSites } from '../../lib/site-access'
import type { State } from '../../lib/types'
import { HeaderTableComponent } from '../lib/header-table.component'
import { MatcherTableComponent } from '../lib/matcher-table.component'
import type { PopupElements } from './popup-elements'
import { renderProfileAppearance, updateColorSelection } from './profile-appearance'
import { getProfileColor } from './profile-colors'
import type { ProfileKeyboardNavigation } from './profile-keyboard-navigation'
import { renderProfileList } from './profile-list-view'

interface PopupViewHandlers {
  changeHeader: (
    id: string,
    request: boolean,
    field: 'header' | 'value' | 'enabled',
    value: string | boolean
  ) => void
  changeMatcher: (id: string, field: 'urlFilter' | 'types', value: string) => void
  removeHeader: (id: string, request: boolean) => void
  removeMatcher: (id: string) => void
}

/** Renders popup state and owns row-component lifecycles. */
export class PopupView {
  private keyboardNavigation?: ProfileKeyboardNavigation
  private matcherList?: MatcherTableComponent
  private requestHeaders?: HeaderTableComponent
  private responseHeaders?: HeaderTableComponent
  private selectionChange = () => {}

  constructor(
    private document: Document,
    private elements: PopupElements,
    private state: State,
    handlers: PopupViewHandlers
  ) {
    if (elements.matchers)
      this.matcherList = new MatcherTableComponent(elements.matchers, {
        onChange: handlers.changeMatcher,
        onDelete: handlers.removeMatcher,
      })
    if (elements.requestHeaders)
      this.requestHeaders = new HeaderTableComponent(
        elements.requestHeaders,
        {
          onChange: (id, field, value) => handlers.changeHeader(id, true, field, value),
          onDelete: (id) => handlers.removeHeader(id, true),
        },
        true
      )
    if (elements.responseHeaders)
      this.responseHeaders = new HeaderTableComponent(
        elements.responseHeaders,
        {
          onChange: (id, field, value) => handlers.changeHeader(id, false, field, value),
          onDelete: (id) => handlers.removeHeader(id, false),
        },
        false
      )
  }

  setKeyboardNavigation(navigation: ProfileKeyboardNavigation): void {
    this.keyboardNavigation = navigation
  }

  setSelectionChangeHandler(handler: () => void): void {
    this.selectionChange = handler
  }

  renderList(): void {
    const empty = this.state.profiles.length === 0
    if (this.elements.sidebarSearch) {
      this.elements.sidebarSearch.disabled = empty
      if (empty) this.elements.sidebarSearch.value = ''
    }
    this.document.querySelector<HTMLElement>('#emptyProfileList')!.hidden = !empty
    this.document.querySelector<HTMLButtonElement>('[data-action="exportAll"]')!.disabled = empty
    this.state.filtered = renderProfileList(
      this.elements,
      this.state.profiles,
      this.state.current?.id,
      this.elements.sidebarSearch?.value ?? ''
    )
    this.keyboardNavigation?.reset()
  }

  select(id: string | null): void {
    const profile = this.state.profiles.find((item) => item.id === id) ?? this.state.profiles[0]
    this.state.current = profile ?? null
    const query = this.elements.sidebarSearch?.value.trim().toLowerCase()
    if (
      profile &&
      query &&
      !profile.name.toLowerCase().includes(query) &&
      !profile.notes?.toLowerCase().includes(query)
    ) {
      this.elements.sidebarSearch!.value = ''
      this.renderList()
    }

    for (const link of this.document.querySelectorAll<HTMLElement>('a[data-id]')) {
      const selected = link.dataset.id === profile?.id
      link.setAttribute('aria-selected', String(selected))
      link.classList.toggle('active', selected)
    }

    if (!profile) {
      this.elements.detailPane?.classList.add('hidden')
      this.elements.detailEmpty?.classList.remove('hidden')
      this.document.querySelector<HTMLButtonElement>('#newProfileEmpty')?.focus()
      this.selectionChange()
      return
    }

    this.elements.detailEmpty?.classList.add('hidden')
    this.elements.detailPane?.classList.remove('hidden')
    const accessInput = this.document.querySelector<HTMLInputElement>('#accessSites')!
    try {
      accessInput.value = suggestedAccessSites(profile).join(', ')
    } catch {
      accessInput.value = ''
    }
    if (this.elements.profileName) this.elements.profileName.value = profile.name || ''
    if (this.elements.profileInitials) this.elements.profileInitials.value = profile.initials || ''
    if (this.elements.profileNotes) this.elements.profileNotes.value = profile.notes || ''
    if (this.elements.profileEnabled) this.elements.profileEnabled.checked = profile.enabled
    this.document.querySelector('#profileEnabledStatus')!.textContent = profile.enabled
      ? 'Profile is on'
      : 'Profile is off'

    const color = profile.color || 'blue'
    renderProfileAppearance(
      this.elements.profileAvatarButton,
      this.elements.profileAvatarInitials,
      profile.name,
      profile.initials,
      color
    )
    updateColorSelection(this.document, color)
    this.renderMatchers()
    this.renderHeaders()
    this.selectionChange()
  }

  renderMatchers(): void {
    if (this.state.current) this.matcherList?.render(this.state.current.matchers)
  }

  renderHeaders(): void {
    if (!this.state.current) return
    this.requestHeaders?.render(this.state.current.requestHeaders)
    this.responseHeaders?.render(this.state.current.responseHeaders)
  }

  renderAvatar(): void {
    const profile = this.state.current
    if (!profile) return
    renderProfileAppearance(
      this.elements.profileAvatarButton,
      this.elements.profileAvatarInitials,
      profile.name,
      profile.initials,
      getProfileColor(profile.color).token
    )
  }
}
