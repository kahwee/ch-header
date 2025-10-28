import { STORAGE_KEYS, Matcher, HeaderOp, Profile, State } from '../lib/types'
import { PopupController } from './controller'
import { profileListItem, getPopupTemplate } from './popup-template'
import { escapeHtml, tailwindToHex, hexToTailwind } from './utils'
import './components/checkbox-element'
import '@tailwindplus/elements'
import searchIcon from './icons/search.svg?raw'
import plusIcon from './icons/plus.svg?raw'
import folderPlusIcon from './icons/folder-plus.svg?raw'
import trashIcon from './icons/trash.svg?raw'

const K = STORAGE_KEYS

const $$ = (sel: string): HTMLElement[] => Array.from(document.querySelectorAll(sel))

// Inject the template into the root element
function initializeTemplate(): void {
  const root = document.querySelector('#root')
  if (root) {
    root.innerHTML = getPopupTemplate()
  }
}

let el: {
  list: HTMLUListElement | null
  sidebarSearch: HTMLInputElement | null
  newBtn: HTMLButtonElement | null
  footerNewBtn: HTMLButtonElement | null
  detailPane: HTMLElement | null
  detailEmpty: HTMLElement | null
  name: HTMLInputElement | null
  profileAvatarBtn: HTMLButtonElement | null
  profileAvatarInitials: HTMLElement | null
  initials: HTMLInputElement | null
  notes: HTMLTextAreaElement | null
  enabled: HTMLInputElement | null
  addMatcher: HTMLButtonElement | null
  matchers: HTMLElement | null
  addReq: HTMLButtonElement | null
  req: HTMLElement | null
  addRes: HTMLButtonElement | null
  res: HTMLElement | null
  apply: HTMLButtonElement | null
  importFile: HTMLInputElement | null
  noResults: HTMLElement | null
  searchResults: HTMLElement | null
}

// Command palette navigation state
let keyboardSelectedIndex = -1

function initializeElements(): void {
  el = {
    list: document.querySelector('#profileList') as HTMLUListElement | null,
    sidebarSearch: document.querySelector('#sidebarSearch') as HTMLInputElement | null,
    newBtn: document.querySelector('#newProfile') as HTMLButtonElement | null,
    footerNewBtn: document.querySelector('#footerNewProfile') as HTMLButtonElement | null,
    detailPane: document.querySelector('#detail') as HTMLElement | null,
    detailEmpty: document.querySelector('#detailEmpty') as HTMLElement | null,
    name: document.querySelector('#profileName') as HTMLInputElement | null,
    profileAvatarBtn: document.querySelector('#profileAvatarBtn') as HTMLButtonElement | null,
    profileAvatarInitials: document.querySelector('#profileAvatarInitials') as HTMLElement | null,
    initials: document.querySelector('#profileInitials') as HTMLInputElement | null,
    notes: document.querySelector('#profileNotes') as HTMLTextAreaElement | null,
    enabled: document.querySelector('#enabled') as HTMLInputElement | null,
    addMatcher: document.querySelector('#addMatcher') as HTMLButtonElement | null,
    matchers: document.querySelector('#matchers') as HTMLElement | null,
    addReq: document.querySelector('#addReq') as HTMLButtonElement | null,
    req: document.querySelector('#reqHeaders') as HTMLElement | null,
    addRes: document.querySelector('#addRes') as HTMLButtonElement | null,
    res: document.querySelector('#resHeaders') as HTMLElement | null,
    apply: document.querySelector('#apply') as HTMLButtonElement | null,
    importFile: document.querySelector('#importFile') as HTMLInputElement | null,
    noResults: document.querySelector('#noResults') as HTMLElement | null,
    searchResults: document.querySelector('#searchResults') as HTMLElement | null,
  }
}

const state: State = {
  profiles: [],
  activeId: null,
  filtered: [],
  current: null,
}

// Controller instance initialized after load()
let controller: PopupController

// Inject SVG icons into static HTML elements
function injectIcons(): void {
  // Search icon in sidebar command palette (overlayed on input)
  const sidebarSearchParent = document.querySelector('#sidebarSearch')?.parentElement
  const sidebarSearchIcon = sidebarSearchParent?.querySelector('span')
  if (sidebarSearchIcon) {
    sidebarSearchIcon.innerHTML = searchIcon
  }

  // Plus icon for new profile button
  const newProfileBtn = document.querySelector('#newProfile')?.querySelector('span')
  if (newProfileBtn) {
    newProfileBtn.innerHTML = plusIcon
  }

  // Empty state folder-plus icon
  const emptyStateIcon = document.querySelector('#detailEmpty')?.querySelector('svg')?.parentElement
  if (emptyStateIcon) {
    emptyStateIcon.innerHTML = folderPlusIcon
  }

  // New profile button in empty state
  const newProfileEmptyBtn = document
    .querySelector('#newProfileEmpty')
    ?.querySelector('svg')?.parentElement
  if (newProfileEmptyBtn) {
    newProfileEmptyBtn.innerHTML = `<span class="mr-1.5 -ml-0.5 w-5 h-5 flex items-center justify-center">${plusIcon}</span>`
  }

  // Inject SVG icons into header action buttons
  const addReqBtn = document.querySelector('#addReq')?.querySelector('span')
  if (addReqBtn) {
    addReqBtn.innerHTML = plusIcon
  }

  const addResBtn = document.querySelector('#addRes')?.querySelector('span')
  if (addResBtn) {
    addResBtn.innerHTML = plusIcon
  }
}

async function load(): Promise<void> {
  const data = await chrome.storage.local.get([K.PROFILES, K.ACTIVE_PROFILE_ID])
  const profiles: Profile[] = data[K.PROFILES] || []
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

  select(state.activeId)
  renderList()
}

function saveProfiles(): Promise<void> {
  return chrome.storage.local.set({ [K.PROFILES]: state.profiles })
}

function renderList(): void {
  const q = (el.sidebarSearch?.value || '').toLowerCase()

  // Always show all profiles in "All Profiles" section
  if (el.list) {
    el.list.innerHTML = state.profiles
      .map((p) => profileListItem(p, p.id === state.current?.id))
      .join('')
  }

  // Handle search results filtering
  if (q.length > 0) {
    state.filtered = state.profiles.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.notes || '').toLowerCase().includes(q)
    )

    // Show search results group and populate with filtered items
    if (el.searchResults) {
      el.searchResults.removeAttribute('hidden')
      el.searchResults.classList.add('p-2')
      el.searchResults.innerHTML = `
        <h2 class="mt-2 mb-2 px-3 text-xs font-semibold text-gray-400">Search results</h2>
        <ul class="list-none m-0 p-0 text-sm text-gray-300" role="list">
          ${state.filtered.map((p) => profileListItem(p, p.id === state.current?.id)).join('')}
        </ul>
      `
    }

    // Hide no results only if we have matches
    const hasResults = state.filtered.length > 0
    if (el.noResults) {
      el.noResults.classList.toggle('hidden', hasResults)
    }
  } else {
    // Hide search results group when search is empty
    if (el.searchResults) {
      el.searchResults.setAttribute('hidden', '')
      el.searchResults.classList.remove('p-2')
    }

    // Hide no results when no search
    if (el.noResults) {
      el.noResults.classList.add('hidden')
    }
  }

  // Reset keyboard navigation state
  keyboardSelectedIndex = -1
}

function select(id: string | null): void {
  const p = state.profiles.find((x) => x.id === id) || state.profiles[0]
  state.current = p || null

  // Update list items with aria-selected
  $$('a[data-id]').forEach((link) => {
    const isActive = link.dataset.id === p?.id
    link.setAttribute('aria-selected', isActive ? 'true' : 'false')
  })

  if (!p) {
    el.detailPane?.classList.add('hidden')
    el.detailEmpty?.classList.remove('hidden')
    return
  }

  el.detailEmpty?.classList.add('hidden')
  el.detailPane?.classList.remove('hidden')

  if (el.name) el.name.value = p.name || ''
  if (el.profileAvatarBtn) el.profileAvatarBtn.style.backgroundColor = p.color || '#7e22ce'
  if (el.initials) el.initials.value = p.initials || ''
  if (el.notes) el.notes.value = p.notes || ''
  if (el.enabled) el.enabled.checked = !!p.enabled

  // Update the initials preview in the profile avatar
  updateAvatarPreview(p.name, p.initials)

  // Highlight the selected color in the color picker (convert hex to Tailwind name)
  const tailwindColor = hexToTailwind(p.color || '#7e22ce')
  updateSelectedColorIndicator(tailwindColor)

  renderMatchers()
  renderHeaders()
}

function renderMatchers(): void {
  const p = state.current
  if (!p || !el.matchers) return

  el.matchers.innerHTML = (p.matchers || []).map((m) => matcherRow(m)).join('')
}

function matcherRow(m: Matcher): string {
  const selectedTypes = m.resourceTypes || []
  // If urlFilter is "*", show empty in UI (means "all domains")
  const displayUrlFilter = m.urlFilter === '*' ? '' : m.urlFilter

  return `
    <div class="group flex gap-2 items-center p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors" data-mid="${m.id}">
      <input class="flex-[2] rounded-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500" data-role="urlFilter" placeholder="Leave empty for all domains" value="${escapeHtml(displayUrlFilter)}">
      <select class="flex-1 rounded-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer" data-role="types">
        <option value="">All request types</option>
        <option value="xmlhttprequest" ${selectedTypes.includes('xmlhttprequest') ? 'selected' : ''}>XHR/Fetch</option>
        <option value="script" ${selectedTypes.includes('script') ? 'selected' : ''}>Scripts</option>
        <option value="stylesheet" ${selectedTypes.includes('stylesheet') ? 'selected' : ''}>Stylesheets</option>
        <option value="image" ${selectedTypes.includes('image') ? 'selected' : ''}>Images</option>
        <option value="font" ${selectedTypes.includes('font') ? 'selected' : ''}>Fonts</option>
        <option value="document" ${selectedTypes.includes('document') ? 'selected' : ''}>Documents</option>
        <option value="sub_frame" ${selectedTypes.includes('sub_frame') ? 'selected' : ''}>Iframes</option>
      </select>
      <button class="flex-shrink-0 p-2 rounded-md bg-transparent hover:bg-white/10 text-text hover:text-danger transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" data-action="removeMatcher" title="Remove matcher">
        <span class="inline-flex items-center justify-center w-4 h-4">${trashIcon}</span>
      </button>
    </div>
  `
}

function renderHeaders(): void {
  const p = state.current
  if (!p) return

  if (el.req) el.req.innerHTML = (p.requestHeaders || []).map((h) => headerRow(h, true)).join('')
  if (el.res) el.res.innerHTML = (p.responseHeaders || []).map((h) => headerRow(h, false)).join('')
}

function headerRow(h: HeaderOp, isReq: boolean): string {
  return `
    <div class="flex items-center gap-2 rounded-lg bg-white/3 hover:bg-white/5 p-3 transition-colors" data-hid="${h.id}" data-kind="${isReq ? 'req' : 'res'}">
      <input type="checkbox" class="w-4 h-4 rounded cursor-pointer accent-primary flex-shrink-0" data-role="enabled" ${h.enabled !== false ? 'checked' : ''}>
      <input type="text" class="flex-1 rounded-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500" data-role="header" placeholder="Header name (e.g. X-Custom-Header)" value="${escapeHtml(h.header || '')}">
      <input type="text" class="flex-1 rounded-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500" data-role="value" placeholder="Value" value="${escapeHtml(h.value || '')}">
      <button class="flex-shrink-0 p-2 rounded-md bg-transparent hover:bg-white/10 text-text hover:text-danger transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" data-action="removeHeader" title="Delete"><span class="inline-flex items-center justify-center w-4 h-4">${trashIcon}</span></button>
    </div>
  `
}

// Set up event listeners (called after elements are initialized)
function setupEventListeners(): void {
  if (el.sidebarSearch) {
    el.sidebarSearch.addEventListener('input', () => {
      renderList()
    })
  }

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
      const btn = (e.target as HTMLElement).closest('button[data-action]')
      if (!btn) return

      const action = (btn as any).dataset.action
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
      const tailwindColor = colorBtn.getAttribute('data-color')
      if (tailwindColor) {
        const hexColor = tailwindToHex(tailwindColor)
        controller.onProfileColorChange(hexColor)
        // Update the profile avatar background
        if (el.profileAvatarBtn) {
          el.profileAvatarBtn.style.backgroundColor = hexColor
        }
        // Update the selected color visual indicator
        updateSelectedColorIndicator(tailwindColor)
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
        const action = (el.importFile as any)?.dataset.importAction
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
  const profileLink = target.closest('a[data-id]') as HTMLElement | null
  if (profileLink) {
    const id = (profileLink as any).dataset.id
    if (id) {
      e.preventDefault()
      controller.onProfileItemClick(id)
    }
    return
  }

  const btn = target.closest('button') as HTMLButtonElement | null
  if (!btn) return

  const action = (btn as any).dataset.action

  if (btn === el.newBtn || btn === el.footerNewBtn || btn.id === 'newProfileEmpty')
    return controller.onNewProfile()
  if (btn === el.addMatcher) return controller.onAddMatcher()
  if (btn === el.addReq) return controller.onAddHeader(true)
  if (btn === el.addRes) return controller.onAddHeader(false)
  if (btn === el.apply) return controller.onApply()

  // Import menu items
  if (action === 'importHeaders') {
    if (el.importFile) {
      el.importFile.dataset.importAction = 'headers'
      el.importFile.click()
    }
    return
  }

  if (action === 'importProfile') {
    if (el.importFile) {
      el.importFile.dataset.importAction = 'profile'
      el.importFile.click()
    }
    return
  }

  if (action === 'duplicate') {
    return controller.onDuplicateProfile()
  }

  if (action === 'delete') {
    return controller.onDeleteProfile()
  }

  if (action === 'removeMatcher') {
    const row = btn.closest('[data-mid]') as HTMLElement | null
    const mid = (row as any)?.dataset.mid
    if (mid) controller.onRemoveMatcher(mid)
  }

  if (action === 'removeHeader') {
    const wrap = btn.closest('[data-hid]') as HTMLElement | null
    const hid = (wrap as any)?.dataset.hid
    const kind = (wrap as any)?.dataset.kind
    if (hid && kind) controller.onRemoveHeader(hid, kind === 'req')
  }
})

document.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

  if (target === el.sidebarSearch) {
    controller.onSearchChange((el.sidebarSearch as HTMLInputElement)?.value || '')
    return
  }

  if (target === el.name) {
    const newName = (el.name as HTMLInputElement)?.value || ''
    controller.onProfileNameChange(newName)
    // Update the profile avatar preview with new name
    if (state.current) {
      updateAvatarPreview(newName, state.current.initials)
    }
    return
  }

  if (target === el.initials) {
    if (state.current) {
      state.current.initials = ((el.initials as HTMLInputElement)?.value || '').toUpperCase()
      // Update the profile avatar preview
      updateAvatarPreview(state.current.name, state.current.initials)
      syncAndRender({ listOnly: true })
    }
    return
  }

  if (target === el.notes) {
    controller.onProfileNotesChange((el.notes as HTMLTextAreaElement)?.value || '')
    return
  }

  // Matcher fields
  if (target.closest("[data-role='urlFilter']")) {
    const row = target.closest('[data-mid]') as HTMLElement | null
    const mid = (row as any)?.dataset.mid
    const value = (row?.querySelector("[data-role='urlFilter']") as HTMLInputElement)?.value || ''
    if (mid) controller.onMatcherChange(mid, 'urlFilter', value)
    return
  }

  if (target.closest("[data-role='types']")) {
    const row = target.closest('[data-mid]') as HTMLElement | null
    const mid = (row as any)?.dataset.mid
    const value = (row?.querySelector("[data-role='types']") as HTMLInputElement)?.value || ''
    if (mid) controller.onMatcherChange(mid, 'types', value)
    return
  }

  // Header fields
  if (target.closest('[data-hid]')) {
    const item = target.closest('[data-hid]') as HTMLElement | null
    const kind = (item as any)?.dataset.kind
    const isReq = kind === 'req'
    const hid = (item as any)?.dataset.hid

    if (target.closest("[data-role='header']")) {
      const value = (item?.querySelector("[data-role='header']") as HTMLInputElement)?.value || ''
      if (hid) controller.onHeaderChange(hid, isReq, 'header', value)
    } else if (target.closest("[data-role='value']")) {
      const value = (item?.querySelector("[data-role='value']") as HTMLInputElement)?.value || ''
      if (hid) controller.onHeaderChange(hid, isReq, 'value', value)
    } else if (target.closest("[data-role='enabled']")) {
      const checked =
        (item?.querySelector("[data-role='enabled']") as HTMLInputElement)?.checked ?? true
      if (hid) controller.onHeaderChange(hid, isReq, 'enabled', checked)
    }
    return
  }

  if (target === el.enabled) {
    const checked = (el.enabled as HTMLInputElement)?.checked || false
    controller.onProfileEnabledChange(checked)
  }
})

interface SyncOpts {
  listOnly?: boolean
}

function updateAvatarPreview(name: string, customInitials?: string): void {
  // Use custom avatar or generate from name (first character only)
  const displayAvatar =
    customInitials?.slice(0, 1) ||
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 1) ||
    '?'

  if (el.profileAvatarInitials) {
    el.profileAvatarInitials.textContent = displayAvatar
    // Ensure text shadow is applied
    el.profileAvatarInitials.style.textShadow = '0 1px 3px rgba(0,0,0,0.5)'
  }
}

function updateSelectedColorIndicator(selectedTailwindColor: string): void {
  const colorOptions = document.querySelectorAll('.color-option')
  colorOptions.forEach((btn) => {
    const btnTailwindColor = btn.getAttribute('data-color')
    const btnHex = btn.getAttribute('data-hex')
    if (btnTailwindColor === selectedTailwindColor) {
      // Selected color - prominent white border
      btn.setAttribute('style', `background-color: ${btnHex}; border: 3px solid white;`)
    } else {
      // Not selected - subtle border
      btn.setAttribute(
        'style',
        `background-color: ${btnHex}; border: 2px solid rgba(255,255,255,0.2);`
      )
    }
  })
}

function syncAndRender(opts?: SyncOpts): void {
  saveProfiles()
  if (!opts?.listOnly) select(state.current?.id || null)
  renderList()
}

// Keyboard: quick focus search (Ctrl/Cmd+K)
// Initialize: template → elements → icons → event listeners → load
initializeTemplate()
initializeElements()
injectIcons()
setupEventListeners()

// Set up keyboard listener after elements are initialized
window.addEventListener('keydown', (e) => {
  // Ctrl/Cmd+K: Focus sidebar search input
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    el.sidebarSearch?.focus()
    return
  }

  // Command palette keyboard navigation (when sidebar search is focused)
  const isSearchFocused = e.target === el.sidebarSearch
  if (!isSearchFocused) return

  const items = Array.from(el.list?.querySelectorAll('a[data-id]') || [])
  const itemCount = items.length

  if (itemCount === 0) return

  // Arrow Down: move to next profile
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    keyboardSelectedIndex = Math.min(keyboardSelectedIndex + 1, itemCount - 1)
    updateKeyboardSelection(items)
    return
  }

  // Arrow Up: move to previous profile
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    keyboardSelectedIndex = Math.max(keyboardSelectedIndex - 1, -1)
    updateKeyboardSelection(items)
    return
  }

  // Enter: select the highlighted profile
  if (e.key === 'Enter') {
    e.preventDefault()
    if (keyboardSelectedIndex >= 0 && keyboardSelectedIndex < itemCount) {
      const item = items[keyboardSelectedIndex] as HTMLElement
      const id = item.dataset.id
      if (id) controller.onProfileItemClick(id)
    }
    return
  }

  // Escape: clear keyboard selection
  if (e.key === 'Escape') {
    e.preventDefault()
    keyboardSelectedIndex = -1
    el.sidebarSearch?.blur()
    updateKeyboardSelection(items)
    return
  }
})

// Helper function to update keyboard selection styling and load details
function updateKeyboardSelection(items: Element[]): void {
  items.forEach((item, index) => {
    if (index === keyboardSelectedIndex) {
      item.classList.add('bg-white/10')
      // Load the profile details for keyboard navigation
      const id = (item as any).dataset.id
      if (id) select(id)
    } else {
      item.classList.remove('bg-white/10')
    }
  })

  // Scroll the selected item into view
  if (keyboardSelectedIndex >= 0 && keyboardSelectedIndex < items.length) {
    const item = items[keyboardSelectedIndex] as HTMLElement
    item.scrollIntoView({ block: 'nearest' })
  }
}

load()
