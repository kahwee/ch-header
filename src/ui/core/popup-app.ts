import { parseAccessSites, requestSiteAccess, suggestedAccessSites } from '../../lib/site-access'
import { setupProfileContextMenu, type ProfileAction } from './profile-context-menu'
import { setupProfileSharing } from './profile-sharing'
import { profileColorInk } from './profile-colors'
import { STORAGE_KEYS, type ExtensionStorage, type Profile, type State } from '../../lib/types'
import { PopupController } from './controller'
import { getPopupTemplate } from './popup-template'
import { MatcherTableComponent } from '../lib/matcher-table.component'
import { HeaderTableComponent } from '../lib/header-table.component'
import '../components/common/checkbox-element'
import { setupDropdowns } from './dropdowns'
import { queryPopupElements, type PopupElements } from './popup-elements'
import { renderProfileAppearance, updateColorSelection } from './profile-appearance'
import { getProfileColor } from './profile-colors'
import {
  setupProfileKeyboardNavigation,
  type ProfileKeyboardNavigation,
} from './profile-keyboard-navigation'
import { renderProfileList } from './profile-list-view'

/** Mount the real popup in its own document; resolves when storage is loaded. */
export async function mountPopup(document: Document = globalThis.document): Promise<void> {
  const K = STORAGE_KEYS
  const saveFailure = 'Changes could not be saved. Keep this popup open and press Apply to retry.'

  const $$ = (sel: string): HTMLElement[] => Array.from(document.querySelectorAll(sel))

  // Inject the template into the root element
  function initializeTemplate(): void {
    const root = document.querySelector('#root')
    if (root) {
      root.innerHTML = getPopupTemplate()
    }
  }

  let el: PopupElements

  let keyboardNavigation: ProfileKeyboardNavigation | undefined

  const state: State = {
    profiles: [],
    activeId: null,
    filtered: [],
    current: null,
  }

  // Controller instance initialized after load()
  let controller: PopupController
  let sharing: ReturnType<typeof setupProfileSharing>
  function notify(message: string, undo = false): void {
    const notice = document.querySelector<HTMLElement>('#profileNotice')!
    notice.querySelector('span')!.textContent = message
    notice.querySelector<HTMLElement>('#undoDelete')!.hidden = !undo
    notice.hidden = false
  }
  function profileAction(action: ProfileAction, id: string): void {
    const profile = state.profiles.find((p) => p.id === id)
    if (!profile) return
    if (action === 'toggle') setProfileEnabled(id, !profile.enabled)
    if (action === 'rename') {
      select(id)
      el.profileName?.focus()
      el.profileName?.select()
    }
    if (action === 'duplicate') controller.onDuplicateProfile(id)
    if (action === 'copy') void sharing.copyProfile(id)
    if (action === 'export') sharing.open('export', id)
    if (action === 'delete' && controller.onDeleteProfile(id))
      notify(`Deleted “${profile.name}”.`, true)
  }

  let enableAttempt = 0
  function setProfileEnabled(id: string, enabled: boolean): void {
    const attempt = ++enableAttempt
    const profile = state.profiles.find((p) => p.id === id)
    if (!profile) return
    if (!enabled) {
      controller.onSetProfileEnabled(id, false)
      return
    }
    try {
      const sites = suggestedAccessSites(profile)
      if (!sites.length) throw new Error('Add allowed sites before turning this profile on.')
      profile.accessSites = sites
      const snapshot = JSON.stringify(profile)
      const request = requestSiteAccess(sites)
      select(state.current?.id ?? null)
      void request
        .then((granted) => {
          if (attempt !== enableAttempt) return
          const current = state.profiles.find((p) => p.id === id)
          if (!current || JSON.stringify(current) !== snapshot) {
            notify('Profile changed while requesting access. Turn it on again.')
            return
          }
          if (!granted) {
            notify('Website access was not granted. The profile stays off.')
            return
          }
          controller.onSetProfileEnabled(id, true)
        })
        .catch((error) =>
          notify(
            `Could not request website access. ${error instanceof Error ? error.message : 'Try reopening the popup.'} The profile stays off.`
          )
        )
    } catch (error) {
      select(state.current?.id ?? null)
      notify(error instanceof Error ? error.message : 'Check allowed sites.')
    }
  }

  // Component instances initialized after elements are available
  let matcherList: MatcherTableComponent
  let headerListReq: HeaderTableComponent
  let headerListRes: HeaderTableComponent

  async function load(): Promise<void> {
    const data = await chrome.storage.local.get<Partial<ExtensionStorage>>([
      K.PROFILES,
      K.ACTIVE_PROFILE_ID,
    ])
    const profiles: Profile[] = (data[K.PROFILES] || []).map((profile) => ({
      ...profile,
      color: getProfileColor(profile.color).token,
    }))
    const activeProfileId: string | undefined = data[K.ACTIVE_PROFILE_ID]

    state.profiles = profiles
    state.activeId = activeProfileId ?? profiles[0]?.id ?? null
    state.filtered = profiles

    // Initialize controller with callbacks
    controller = new PopupController(state, {
      renderList,
      renderHeaders,
      renderMatchers,
      select,
      saveProfiles,
      syncAndRender,
    })

    // Initialize MatcherTableComponent
    if (el.matchers) {
      matcherList = new MatcherTableComponent(el.matchers, {
        onChange: (id, field, value) => controller.onMatcherChange(id, field, value),
        onDelete: (id) => controller.onRemoveMatcher(id),
      })
    }

    // Initialize HeaderTableComponents (request and response)
    if (el.requestHeaders) {
      headerListReq = new HeaderTableComponent(
        el.requestHeaders,
        {
          onChange: (id, field, value) => controller.onHeaderChange(id, true, field, value),
          onDelete: (id) => controller.onRemoveHeader(id, true),
        },
        true
      )
    }

    if (el.responseHeaders) {
      headerListRes = new HeaderTableComponent(
        el.responseHeaders,
        {
          onChange: (id, field, value) => controller.onHeaderChange(id, false, field, value),
          onDelete: (id) => controller.onRemoveHeader(id, false),
        },
        false
      )
    }

    select(state.activeId)
    renderList()
  }

  function saveProfiles(): Promise<void> {
    return chrome.storage.local.set({ [K.PROFILES]: state.profiles })
  }

  function renderList(): void {
    const empty = state.profiles.length === 0
    if (el.sidebarSearch) {
      el.sidebarSearch.disabled = empty
      if (empty) el.sidebarSearch.value = ''
    }
    document.querySelector<HTMLElement>('#emptyProfileList')!.hidden = !empty
    document.querySelector<HTMLButtonElement>('[data-action="exportAll"]')!.disabled = empty
    state.filtered = renderProfileList(
      el,
      state.profiles,
      state.current?.id,
      el.sidebarSearch?.value ?? ''
    )
    keyboardNavigation?.reset()
  }

  function select(id: string | null): void {
    const p = state.profiles.find((x) => x.id === id) || state.profiles[0]
    state.current = p || null
    const query = el.sidebarSearch?.value.trim().toLowerCase()
    if (
      p &&
      query &&
      !p.name.toLowerCase().includes(query) &&
      !p.notes?.toLowerCase().includes(query)
    ) {
      el.sidebarSearch!.value = ''
      renderList()
    }

    // Update list items with aria-selected and active class
    $$('a[data-id]').forEach((link) => {
      const isActive = link.dataset.id === p?.id
      link.setAttribute('aria-selected', isActive ? 'true' : 'false')
      link.classList.toggle('active', isActive)
    })

    if (!p) {
      el.detailPane?.classList.add('hidden')
      el.detailEmpty?.classList.remove('hidden')
      document.querySelector<HTMLButtonElement>('#newProfileEmpty')?.focus()
      return
    }

    el.detailEmpty?.classList.add('hidden')
    el.detailPane?.classList.remove('hidden')

    const accessInput = document.querySelector<HTMLInputElement>('#accessSites')!
    try {
      accessInput.value = suggestedAccessSites(p).join(', ')
    } catch {
      accessInput.value = ''
    }
    if (el.profileName) el.profileName.value = p.name || ''
    if (el.profileInitials) el.profileInitials.value = p.initials || ''
    if (el.profileNotes) el.profileNotes.value = p.notes || ''
    if (el.profileEnabled) el.profileEnabled.checked = !!p.enabled
    const enabledStatus = document.querySelector('#profileEnabledStatus')
    if (enabledStatus) enabledStatus.textContent = p.enabled ? 'Profile is on' : 'Profile is off'

    const colorToken = p.color || 'blue'
    renderProfileAppearance(
      el.profileAvatarButton,
      el.profileAvatarInitials,
      p.name,
      p.initials,
      colorToken
    )
    updateColorSelection(document, colorToken)

    renderMatchers()
    renderHeaders()
  }

  function renderMatchers(): void {
    const p = state.current
    if (!p || !matcherList) return

    matcherList.render(p.matchers || [])
  }

  function renderHeaders(): void {
    const p = state.current
    if (!p) return

    if (headerListReq) headerListReq.render(p.requestHeaders || [])
    if (headerListRes) headerListRes.render(p.responseHeaders || [])
  }

  // Set up event listeners (called after elements are initialized)
  function setupEventListeners(): void {
    el.detailPane?.addEventListener('submit', (event) => {
      event.preventDefault()
      void saveProfiles()
        .then(() => controller.onApply())
        .then((error) => {
          if (error) notify(error)
          else if (document.querySelector('#profileNotice span')?.textContent === saveFailure)
            document.querySelector<HTMLElement>('#profileNotice')!.hidden = true
        })
        .catch(() => notify(saveFailure))
    })
    function renderGrants(): void {
      chrome.permissions.getAll((grants) => {
        document.querySelector<HTMLElement>('#emptyRevokeAccess')!.hidden = !grants.origins?.length
        document.querySelector('#grantedSites')!.textContent = grants.origins?.length
          ? `Granted to ChHeader: ${[...new Set(grants.origins.map((origin) => origin.replace(/^https?:\/\//, '').replace(/\/\*$/, '')))].join(', ')}`
          : 'No website access granted.'
      })
    }
    renderGrants()
    chrome.permissions.onAdded.addListener(renderGrants)
    chrome.permissions.onRemoved.addListener(renderGrants)
    document
      .querySelector<HTMLInputElement>('#accessSites')!
      .addEventListener('change', (event) => {
        if (!state.current) return
        const input = event.target as HTMLInputElement
        try {
          const sites = parseAccessSites(input.value)
          ++enableAttempt
          state.current.accessSites = sites
          controller.onSetProfileEnabled(state.current.id, false)
          notify('Allowed sites saved. Turn the profile on to approve access.')
        } catch (error) {
          notify(error instanceof Error ? error.message : 'Check allowed sites.')
          select(state.current.id)
        }
      })
    document.querySelectorAll('[data-revoke-access]').forEach((button) => {
      button.addEventListener('click', () => {
        ++enableAttempt
        void chrome.runtime
          .sendMessage({ type: 'revokeSiteAccess' })
          .then((result) => {
            if (!result?.ok) {
              notify('Could not revoke access. Try again.')
              return
            }
            state.profiles.forEach((p) => {
              p.enabled = false
            })
            select(state.current?.id ?? null)
            renderList()
            notify('Website access revoked. All profiles are off.')
          })
          .catch(() => notify('Could not revoke access. Try again.'))
      })
    })
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes[K.PROFILES]) return
      const saved = changes[K.PROFILES].newValue as Profile[]
      // Reflect background permission revocation without discarding an in-progress draft.
      let changed = false
      for (const profile of state.profiles) {
        if (profile.enabled && saved.find((p) => p.id === profile.id)?.enabled === false) {
          profile.enabled = false
          changed = true
        }
      }
      if (changed) {
        select(state.current?.id ?? null)
        renderList()
      }
    })
    setupDropdowns(document)
    sharing = setupProfileSharing(document, {
      profiles: () => state.profiles,
      current: () => state.current,
      importProfiles: (profiles) => controller.onImportProfiles(profiles),
      notify,
    })
    setupProfileContextMenu(
      document,
      (id) => state.profiles.find((p) => p.id === id),
      profileAction
    )
    document.querySelector('#undoDelete')!.addEventListener('click', () => {
      controller.onUndoDeleteProfile()
      notify('Profile restored. It is off.')
    })
    document.querySelector('#dismissNotice')!.addEventListener('click', () => {
      document.querySelector<HTMLElement>('#profileNotice')!.hidden = true
    })

    // Handle dropdown menu actions (sort/clear)
    const actionHandlers: Record<string, () => void> = {
      sortReqHeaders: () => {
        if (state.current) {
          state.current.requestHeaders.sort((a, b) => a.header.localeCompare(b.header))
          syncAndRender()
        }
      },
      clearReqHeaders: () => {
        if (state.current) {
          state.current.requestHeaders = []
          syncAndRender()
        }
      },
      sortResHeaders: () => {
        if (state.current) {
          state.current.responseHeaders.sort((a, b) => a.header.localeCompare(b.header))
          syncAndRender()
        }
      },
      clearResHeaders: () => {
        if (state.current) {
          state.current.responseHeaders = []
          syncAndRender()
        }
      },
      sortMatchers: () => {
        if (state.current) {
          state.current.matchers.sort((a, b) => a.urlFilter.localeCompare(b.urlFilter))
          syncAndRender()
        }
      },
      clearMatchers: () => {
        if (state.current) {
          state.current.matchers = []
          syncAndRender()
        }
      },
    }

    document.addEventListener(
      'click',
      (e) => {
        const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')
        if (!btn) return

        const action = btn.dataset.action
        if (!action) return
        const handler = actionHandlers[action]
        if (handler) {
          handler()
        }
      },
      true
    ) // Use capturing phase to ensure we catch events from inside popovers

    // Color picker popover - handle color selection
    document.addEventListener('click', (e) => {
      const colorBtn = (e.target as HTMLElement).closest('[data-color]')
      if (colorBtn) {
        const colorToken = colorBtn.getAttribute('data-color')
        if (colorToken) {
          controller.onProfileColorChange(colorToken)
          // Update the profile avatar background
          if (el.profileAvatarButton) {
            const color = getProfileColor(colorToken).hex
            el.profileAvatarButton.style.backgroundColor = color
            el.profileAvatarButton.style.color = profileColorInk(color)
          }
          updateColorSelection(document, colorToken)
        }
      }
    })

    // Import file handler
    if (el.importFile) {
      el.importFile.addEventListener('change', async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        try {
          const text = await file.text()
          const data = JSON.parse(text)
          const action = el.importFile?.dataset.importAction
          if (action === 'headers') {
            controller.onImportHeaders(data)
          } else if (action === 'profile') {
            controller.onImportProfile(data)
          }
          // Reset file input
          if (el.importFile) el.importFile.value = ''
        } catch (err) {
          console.error('Failed to import file:', err)
          alert('Failed to import file. Make sure it is valid JSON.')
        }
      })
    }
  }

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    // Profile item click (a tag with data-id in sidebar)
    const profileLink = target.closest<HTMLAnchorElement>('a[data-id]')
    if (profileLink) {
      const id = profileLink.dataset.id
      if (id) {
        e.preventDefault()
        controller.onProfileItemClick(id)
      }
      return
    }

    const btn = target.closest('button') as HTMLButtonElement | null
    if (!btn) return

    const action = btn.dataset.action

    if (btn === el.newProfileButton || btn.id === 'newProfileEmpty') {
      if (el.sidebarSearch) el.sidebarSearch.value = ''
      controller.onNewProfile()
      el.profileName?.focus()
      el.profileName?.select()
      return
    }
    if (btn.id === 'clearProfileSearch') {
      if (el.sidebarSearch) el.sidebarSearch.value = ''
      renderList()
      el.sidebarSearch?.focus()
      return
    }
    if (btn === el.addMatcherButton) return controller.onAddMatcher()
    if (btn === el.addRequestHeaderButton) return controller.onAddHeader(true)
    if (btn === el.addResponseHeaderButton) return controller.onAddHeader(false)

    // Import menu items
    if (action === 'importHeaders') {
      if (el.importFile) {
        el.importFile.dataset.importAction = 'headers'
        el.importFile.click()
      }
      return
    }

    if (action === 'importProfile') return sharing.open('import')
    if (action === 'exportAll') return sharing.open('export', undefined, true)
    if (action && ['duplicate', 'delete', 'copy', 'export'].includes(action) && state.current)
      profileAction(action as ProfileAction, state.current.id)
  })

  document.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

    if (target === el.sidebarSearch) {
      controller.onSearchChange((el.sidebarSearch as HTMLInputElement)?.value || '')
      return
    }

    if (target === el.profileName) {
      const newName = (el.profileName as HTMLInputElement)?.value || ''
      controller.onProfileNameChange(newName)
      // Update the profile avatar preview with new name
      if (state.current) {
        renderProfileAppearance(
          el.profileAvatarButton,
          el.profileAvatarInitials,
          newName,
          state.current.initials,
          state.current.color
        )
      }
      return
    }

    if (target === el.profileInitials) {
      if (state.current) {
        state.current.initials = (
          (el.profileInitials as HTMLInputElement)?.value || ''
        ).toUpperCase()
        renderProfileAppearance(
          el.profileAvatarButton,
          el.profileAvatarInitials,
          state.current.name,
          state.current.initials,
          state.current.color
        )
        syncAndRender({ listOnly: true })
      }
      return
    }

    if (target === el.profileNotes) {
      controller.onProfileNotesChange((el.profileNotes as HTMLTextAreaElement)?.value || '')
      return
    }

    if (target === el.profileEnabled) {
      const checked = (el.profileEnabled as HTMLInputElement)?.checked || false
      if (state.current) setProfileEnabled(state.current.id, checked)
    }
  })

  interface SyncOpts {
    listOnly?: boolean
  }

  function syncAndRender(opts?: SyncOpts): void {
    void saveProfiles().catch(() => notify(saveFailure))
    if (!opts?.listOnly) select(state.current?.id || null)
    renderList()
  }

  // Initialize the template and storage before wiring controls that use the controller.
  initializeTemplate()
  el = queryPopupElements(document)
  await load()
  setupEventListeners()

  if (el.sidebarSearch) {
    keyboardNavigation = setupProfileKeyboardNavigation({
      search: el.sidebarSearch,
      getItems: () =>
        Array.from(
          (el.searchResults?.hidden ? el.list : el.searchResults)?.querySelectorAll<HTMLElement>(
            'a[data-id]'
          ) ?? []
        ),
      onSelect: (id) => controller.onProfileItemClick(id),
    })
  }
}
