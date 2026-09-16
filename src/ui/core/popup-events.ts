import { parseHeadersJSON } from '../../lib/profile-transfer'
import type { State } from '../../lib/types'
import type { CommitOptions, PopupController } from './controller'
import { setupDropdowns } from './dropdowns'
import type { PopupElements } from './popup-elements'
import type { PopupView } from './popup-view'
import { updateColorSelection } from './profile-appearance'
import { getProfileColor, profileColorInk } from './profile-colors'
import type { ProfileAction } from './profile-context-menu'
import type { setupProfileSharing } from './profile-sharing'

interface PopupEventOptions {
  apply: () => Promise<string | null>
  commit: (options?: CommitOptions) => void
  controller: PopupController
  document: Document
  elements: PopupElements
  notify: (message: string, undo?: boolean) => void
  profileAction: (action: ProfileAction, id: string) => void
  setProfileEnabled: (id: string, enabled: boolean) => void
  sharing: ReturnType<typeof setupProfileSharing>
  state: State
  view: PopupView
}

/** Binds popup DOM events to feature controllers. */
export function setupPopupEvents(options: PopupEventOptions): void {
  const {
    apply,
    commit,
    controller,
    document,
    elements,
    notify,
    profileAction,
    setProfileEnabled,
    sharing,
    state,
    view,
  } = options

  elements.detailPane?.addEventListener('submit', (event) => {
    event.preventDefault()
    void apply().then((error) => {
      if (error) notify(error)
    })
  })

  setupDropdowns(document)
  document.querySelector('#undoDelete')!.addEventListener('click', () => {
    controller.onUndoDeleteProfile()
    notify('Profile restored. It is off.')
  })
  document.querySelector('#dismissNotice')!.addEventListener('click', () => {
    document.querySelector<HTMLElement>('#profileNotice')!.hidden = true
  })

  const menuActions: Record<string, () => void> = {
    sortReqHeaders: () => controller.onSortHeaders(true),
    clearReqHeaders: () => controller.onClearHeaders(true),
    sortResHeaders: () => controller.onSortHeaders(false),
    clearResHeaders: () => controller.onClearHeaders(false),
    sortMatchers: () => controller.onSortMatchers(),
    clearMatchers: () => controller.onClearMatchers(),
  }
  document.addEventListener(
    'click',
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')
      const handler = button?.dataset.action ? menuActions[button.dataset.action] : undefined
      handler?.()
    },
    true
  )

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const colorButton = target.closest<HTMLElement>('[data-color]')
    const color = colorButton?.dataset.color
    if (color) {
      controller.onProfileColorChange(color)
      if (elements.profileAvatarButton) {
        const hex = getProfileColor(color).hex
        elements.profileAvatarButton.style.backgroundColor = hex
        elements.profileAvatarButton.style.color = profileColorInk(hex)
      }
      updateColorSelection(document, color)
    }

    const profileLink = target.closest<HTMLAnchorElement>('a[data-id]')
    if (profileLink?.dataset.id) {
      event.preventDefault()
      controller.onProfileItemClick(profileLink.dataset.id)
      return
    }
    const button = target.closest<HTMLButtonElement>('button')
    if (!button) return
    const action = button.dataset.action
    if (button === elements.newProfileButton || button.id === 'newProfileEmpty') {
      if (elements.sidebarSearch) elements.sidebarSearch.value = ''
      controller.onNewProfile()
      elements.profileName?.focus()
      elements.profileName?.select()
    } else if (button.id === 'clearProfileSearch') {
      if (elements.sidebarSearch) elements.sidebarSearch.value = ''
      view.renderList()
      elements.sidebarSearch?.focus()
    } else if (button === elements.addMatcherButton) controller.onAddMatcher()
    else if (button === elements.addRequestHeaderButton) controller.onAddHeader(true)
    else if (button === elements.addResponseHeaderButton) controller.onAddHeader(false)
    else if (action === 'importHeaders') elements.importFile?.click()
    else if (action === 'importProfile') sharing.open('import')
    else if (action === 'exportAll') sharing.open('export', undefined, true)
    else if (action && ['duplicate', 'delete', 'copy', 'export'].includes(action) && state.current)
      profileAction(action as ProfileAction, state.current.id)
  })

  document.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    if (target === elements.sidebarSearch) {
      controller.onSearchChange(elements.sidebarSearch?.value ?? '')
    } else if (target === elements.profileName) {
      controller.onProfileNameChange(elements.profileName?.value ?? '')
      view.renderAvatar()
    } else if (target === elements.profileInitials && state.current) {
      state.current.initials = (elements.profileInitials?.value ?? '').toUpperCase()
      view.renderAvatar()
      commit({ listOnly: true })
    } else if (target === elements.profileNotes) {
      controller.onProfileNotesChange(elements.profileNotes?.value ?? '')
    } else if (target === elements.profileEnabled && state.current) {
      setProfileEnabled(state.current.id, elements.profileEnabled?.checked ?? false)
    }
  })

  elements.importFile?.addEventListener('change', async () => {
    const file = elements.importFile?.files?.[0]
    if (!file) return
    try {
      const headers = parseHeadersJSON(await file.text())
      controller.onImportHeaders(headers)
      notify(`Imported ${headers.length} header${headers.length === 1 ? '' : 's'}.`)
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not import headers.')
    } finally {
      if (elements.importFile) elements.importFile.value = ''
    }
  })
}
