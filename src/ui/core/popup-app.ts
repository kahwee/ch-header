import type { State } from '../../lib/types'
import '../components/common/checkbox-element'
import { type CommitOptions, PopupController } from './controller'
import { queryPopupElements } from './popup-elements'
import { setupPopupEvents } from './popup-events'
import { PopupStore } from './popup-store'
import { getPopupTemplate } from './popup-template'
import { PopupView } from './popup-view'
import { setupProfileAccess } from './profile-access'
import { getProfileColor } from './profile-colors'
import { type ProfileAction, setupProfileContextMenu } from './profile-context-menu'
import { setupProfileKeyboardNavigation } from './profile-keyboard-navigation'
import { setupProfileSharing } from './profile-sharing'

const SAVE_FAILURE = 'Changes could not be saved. Keep this popup open and press Apply to retry.'

/** Mount the real popup in its own document; resolves when storage is loaded. */
export async function mountPopup(document: Document = globalThis.document): Promise<void> {
  const root = document.querySelector('#root')
  if (!root) throw new Error('Popup root is missing.')
  root.innerHTML = getPopupTemplate()

  const elements = queryPopupElements(document)
  const store = new PopupStore()
  const snapshot = await store.load()
  const state: State = {
    profiles: snapshot.profiles.map((profile) => ({
      ...profile,
      color: getProfileColor(profile.color).token,
    })),
    activeId: snapshot.activeProfileId,
    filtered: [],
    current: null,
  }

  function notify(message: string, undo = false): void {
    const notice = document.querySelector<HTMLElement>('#profileNotice')
    const messageElement = notice?.querySelector('span')
    const undoButton = notice?.querySelector<HTMLElement>('#undoDelete')
    if (!notice || !messageElement || !undoButton) return
    messageElement.textContent = message
    undoButton.hidden = !undo
    notice.hidden = false
  }

  let controller: PopupController
  const view = new PopupView(document, elements, state, {
    changeHeader: (id, request, field, value) =>
      controller.onHeaderChange(id, request, field, value),
    removeHeader: (id, request) => controller.onRemoveHeader(id, request),
    changeMatcher: (id, field, value) => controller.onMatcherChange(id, field, value),
    removeMatcher: (id) => controller.onRemoveMatcher(id),
  })

  function commit(options?: CommitOptions): void {
    void store.save(state.profiles, options?.activeProfileId).catch(() => notify(SAVE_FAILURE))
    if (!options?.listOnly) view.select(state.current?.id ?? null)
    view.renderList()
  }

  controller = new PopupController(state, {
    commit,
    renderList: () => view.renderList(),
    select: (id) => view.select(id),
  })

  view.select(state.activeId)
  view.renderList()

  const sharing = setupProfileSharing(document, {
    profiles: () => state.profiles,
    current: () => state.current,
    importProfiles: (profiles) => controller.onImportProfiles(profiles),
    notify,
  })

  let setProfileEnabled: (id: string, enabled: boolean) => void
  function profileAction(action: ProfileAction, id: string): void {
    const profile = state.profiles.find((item) => item.id === id)
    if (!profile) return
    if (action === 'toggle') setProfileEnabled(id, !profile.enabled)
    else if (action === 'rename') {
      view.select(id)
      elements.profileName?.focus()
      elements.profileName?.select()
    } else if (action === 'duplicate') controller.onDuplicateProfile(id)
    else if (action === 'copy') void sharing.copyProfile(id)
    else if (action === 'export') sharing.open('export', id)
    else if (action === 'delete' && controller.onDeleteProfile(id))
      notify(`Deleted “${profile.name}”.`, true)
  }

  const profileAccess = setupProfileAccess({
    controller,
    document,
    notify,
    state,
    view,
  })
  view.setSelectionChangeHandler(profileAccess.refresh)
  profileAccess.refresh()
  setProfileEnabled = profileAccess.setProfileEnabled
  setupProfileContextMenu(
    document,
    (id) => state.profiles.find((profile) => profile.id === id),
    profileAction
  )
  setupPopupEvents({
    apply: async () => {
      try {
        await store.save(state.profiles)
        const error = await controller.onApply()
        if (!error && document.querySelector('#profileNotice span')?.textContent === SAVE_FAILURE)
          document.querySelector<HTMLElement>('#profileNotice')!.hidden = true
        return error
      } catch {
        return SAVE_FAILURE
      }
    },
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
  })

  if (elements.sidebarSearch) {
    view.setKeyboardNavigation(
      setupProfileKeyboardNavigation({
        search: elements.sidebarSearch,
        getItems: () =>
          Array.from(
            (elements.searchResults?.hidden
              ? elements.list
              : elements.searchResults
            )?.querySelectorAll<HTMLElement>('a[data-id]') ?? []
          ),
        onSelect: (id) => controller.onProfileItemClick(id),
      })
    )
  }
}
