/**
 * Shared popup HTML template
 * Used by both popup.html (rendered) and Storybook stories (with mocks)
 */
import { solidButton } from './components/solid-button'
import { sectionHeader } from './components/section-header'
import { renderAvatar } from './components/avatar'
import { menuItem } from './components/menu-item'
import { escapeHtml } from './utils'
import plusIcon from './icons/plus.svg?raw'
import searchIcon from './icons/search.svg?raw'
import folderPlusIcon from './icons/folder-plus.svg?raw'

/**
 * Profile color palette using standard Tailwind token names
 */
export const COLOR_PALETTE = [
  { name: 'Red', tailwind: 'red-700', hex: '#b91c1c' },
  { name: 'Orange', tailwind: 'orange-700', hex: '#b45309' },
  { name: 'Amber', tailwind: 'amber-700', hex: '#ca8a04' },
  { name: 'Yellow', tailwind: 'yellow-700', hex: '#a16207' },
  { name: 'Lime', tailwind: 'lime-700', hex: '#65a30d' },
  { name: 'Green', tailwind: 'green-700', hex: '#15803d' },
  { name: 'Emerald', tailwind: 'emerald-700', hex: '#047857' },
  { name: 'Teal', tailwind: 'teal-700', hex: '#0d9488' },
  { name: 'Cyan', tailwind: 'cyan-700', hex: '#0891b2' },
  { name: 'Sky', tailwind: 'sky-700', hex: '#0369a1' },
  { name: 'Blue', tailwind: 'blue-700', hex: '#1d4ed8' },
  { name: 'Indigo', tailwind: 'indigo-700', hex: '#4f46e5' },
  { name: 'Violet', tailwind: 'violet-700', hex: '#6d28d9' },
  { name: 'Purple', tailwind: 'purple-700', hex: '#7e22ce' },
  { name: 'Fuchsia', tailwind: 'fuchsia-700', hex: '#a21caf' },
  { name: 'Pink', tailwind: 'pink-700', hex: '#be185d' },
  { name: 'Rose', tailwind: 'rose-700', hex: '#be123c' },
  { name: 'Gray', tailwind: 'gray-700', hex: '#374151' },
  { name: 'Zinc', tailwind: 'zinc-700', hex: '#3f3f46' },
  { name: 'Neutral', tailwind: 'neutral-700', hex: '#404040' },
  { name: 'Stone', tailwind: 'stone-700', hex: '#44403c' },
]

/**
 * Build a headers section (Request or Response)
 * Uses sectionHeader component with dynamic menu items
 */
function headersSection(type: 'req' | 'res', title: string, description: string): string {
  const config = {
    req: {
      addButtonId: 'addReq',
      containerId: 'reqHeaders',
      sortAction: 'sortReqHeaders',
      clearAction: 'clearReqHeaders',
    },
    res: {
      addButtonId: 'addRes',
      containerId: 'resHeaders',
      sortAction: 'sortResHeaders',
      clearAction: 'clearResHeaders',
    },
  }

  const { addButtonId, containerId, sortAction, clearAction } = config[type]

  return `
    <div class="pb-4">
      ${description ? `<p class="mb-4 text-sm text-gray-300">${description}</p>` : ''}
      ${sectionHeader({
        title,
        addButtonId,
        addButtonTitle: 'Add header',
        menuItems: [
          { label: 'Sort A-Z', action: sortAction },
          { label: 'Clear all', action: clearAction },
        ],
      })}
      <div class="mt-4 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table class="min-w-full">
              <tbody id="${containerId}"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * Generate the sidebar command palette template
 * Used by both the extension popup and Storybook stories
 */
export function getSidebarTemplate(): string {
  return `<aside class="border-r border-stone-800 bg-stone-900 flex flex-col h-full">
    <el-command-palette class="flex flex-col flex-1 min-h-0">
      <div class="grid grid-cols-1 border-b border-white/10">
        <input
          id="sidebarSearch"
          type="text"
          autofocus
          placeholder="Search profiles…"
          class="col-start-1 row-start-1 h-11 w-full bg-stone-900 pr-4 pl-11 text-sm text-white outline-hidden placeholder:text-gray-500"
          autocomplete="off"
        />
        <span class="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-500 flex items-center justify-center">
          ${searchIcon}
        </span>
      </div>
      <el-command-list class="overflow-y-auto" style="height: 508px;">
        <el-defaults class="block divide-y divide-white/10">
          <div class="p-2">
            <div id="profileList" class="space-y-1"></div>
          </div>
        </el-defaults>
        <el-command-group hidden id="searchResults" class="block"></el-command-group>
        <el-no-results id="noResults" hidden class="block px-6 py-14 text-center text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="mx-auto size-6 text-gray-500">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="mt-4 font-semibold text-white">No results found</p>
          <p class="mt-2 text-gray-400">We couldn't find anything with that term. Please try again.</p>
        </el-no-results>
      </el-command-list>
    </el-command-palette>

    <div class="flex flex-wrap items-center bg-stone-800/50 px-4 py-2.5 text-xs text-gray-300 shrink-0 border-t border-gray-700">
      ${solidButton({ id: 'footerNewProfile', text: 'New', icon: plusIcon, variant: 'secondary', size: 'sm', title: 'Add new profile' })}
    </div>
  </aside>`
}

export function getPopupTemplate(): string {
  return `<div id="app" class="w-[800px] h-[600px] grid grid-rows-[auto_1fr] bg-bg text-text overflow-hidden">
    <main class="grid grid-cols-[280px_1fr] h-full overflow-hidden bg-stone-900">
      ${getSidebarTemplate()}
      <section class="overflow-y-auto overflow-x-hidden min-w-0">
        <div id="detailEmpty" class="flex flex-col items-center justify-center h-full px-4 text-center">
          ${folderPlusIcon}
          <h3 class="mt-2 text-sm font-semibold text-text">No profiles</h3>
          <p class="mt-1 text-sm text-muted">Get started by creating a new profile.</p>
          <div class="mt-6">
            ${solidButton({ id: 'newProfileEmpty', text: 'New Profile', icon: plusIcon, variant: 'primary', size: 'md' })}
          </div>
        </div>
        <form id="detail" class="p-4 grid gap-3 hidden">
          <div class="flex gap-2 items-stretch">
            <button id="profileAvatarBtn" type="button" popovertarget="colorPickerPopover" class="flex shrink-0 items-center justify-center w-8 h-8 rounded-md font-semibold text-white text-sm font-mono focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 cursor-pointer transition-all border border-white/10 hover:border-white/20 group" style="background-color: #7e22ce;" title="Click to choose color">
              <span id="profileAvatarInitials" style="text-shadow: 0 1px 3px rgba(0,0,0,0.5);">P</span>
            </button>
            <div class="grid grow grid-cols-1 focus-within:relative">
              <input id="profileName" type="text" name="profileName" placeholder="Profile name" class="col-start-1 row-start-1 block w-full bg-white/5 py-1.5 px-3 text-base text-text font-semibold outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 rounded-md sm:text-sm/6" required />
            </div>
            <el-dropdown class="inline-block">
              <button type="button" class="inline-flex items-center gap-x-1.5 rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20 focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 cursor-pointer transition-colors">
                Options
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="-mr-1 size-5 text-gray-400">
                  <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
              </button>
              <el-menu anchor="bottom end" popover class="w-56 origin-top-right divide-y divide-white/10 rounded-md bg-stone-800 outline-1 -outline-offset-1 outline-white/10 transition transition-discrete [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in">
                <div class="py-1">
                  ${menuItem({ label: 'Import headers', action: 'importHeaders', title: 'Import headers from JSON' })}
                  ${menuItem({ label: 'Import profile', action: 'importProfile', title: 'Import entire profile from JSON' })}
                </div>
                <div class="py-1">
                  ${menuItem({ label: 'Duplicate', action: 'duplicate' })}
                  ${menuItem({ label: 'Delete', action: 'delete', variant: 'delete' })}
                </div>
              </el-menu>
            </el-dropdown>
          </div>

          <el-popover id="colorPickerPopover" anchor="colorPickerBtn" popover class="w-screen max-w-max overflow-visible bg-transparent px-4 transition transition-discrete [--anchor-gap:--spacing(5)] backdrop:bg-transparent open:flex data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in">
            <div class="flex flex-col gap-4 p-5 bg-stone-800/95 backdrop-blur-sm rounded-xl border border-gray-600/50 shadow-2xl">
              <div class="grid grid-cols-7 gap-3">
                ${COLOR_PALETTE.map(
                  (color) => `
                  <button
                    type="button"
                    data-color="${color.tailwind}"
                    data-hex="${color.hex}"
                    class="w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 cursor-pointer color-option"
                    style="background-color: ${color.hex}; border: 2px solid rgba(255,255,255,0.2)"
                    title="${color.name}"
                    popovertarget="colorPickerPopover"
                    popovertargetaction="hide"
                  ></button>
                `
                ).join('')}
              </div>
              <div class="flex flex-col gap-1.5">
                <label for="profileInitials" class="text-xs font-medium text-gray-400">Avatar (optional, emoji ok!)</label>
                <input
                  id="profileInitials"
                  type="text"
                  maxlength="1"
                  placeholder="A"
                  class="w-full rounded-md bg-white/10 px-3 py-2 text-center text-lg font-bold text-text outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 hover:bg-white/15 transition-colors"
                />
              </div>
            </div>
          </el-popover>
          <input type="file" id="importFile" accept=".json" style="display: none;" />
          <div>
            <textarea id="profileNotes" name="profileNotes" rows="4" class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-text outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-700 sm:text-sm/6" placeholder="Notes (optional)" style="font-family: inherit"></textarea>
          </div>

          ${headersSection('req', 'Request headers', '')}
          ${headersSection('res', 'Response headers', '')}

          <div class="pb-4">
            ${sectionHeader({
              title: 'Matchers',
              addButtonId: 'addMatcher',
              addButtonTitle: 'Add matcher',
              menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
            })}
            <div id="matchers" class="space-y-2"></div>
          </div>

          <footer class="flex items-center justify-between gap-4 p-4 border-t border-gray-700">
            <div class="flex items-center justify-between flex-1">
              <span class="text-sm font-medium text-text">Enable this profile</span>
              <ch-checkbox id="enabled" data-role="enabled"></ch-checkbox>
            </div>
            <div class="flex gap-2">
              ${solidButton({ id: 'apply', text: 'Apply', type: 'submit', variant: 'primary' })}
            </div>
          </footer>
        </form>
      </section>
    </main>
  </div>`
}

/**
 * Render a profile list item
 */
export function profileListItem(
  p: {
    id: string
    name: string
    color: string
    initials?: string
    notes?: string
    enabled: boolean
  },
  isActive: boolean
): string {
  // Use custom avatar if provided, otherwise generate from name (first character only)
  const displayAvatar =
    p.initials?.slice(0, 1) ||
    p.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 1) ||
    '?'

  const labelId = `profile-label-${p.id}`

  // Look up hex color from Tailwind token
  const tailwindColor = p.color || 'purple-700'
  const colorEntry = COLOR_PALETTE.find((c) => c.tailwind === tailwindColor)
  const hexColor = colorEntry?.hex || '#7e22ce'

  return `
    <a href="#" aria-labelledby="${labelId}" aria-selected="${isActive}" data-id="${p.id}" class="group flex cursor-default rounded-lg p-2.5 select-none focus:outline-hidden ${isActive ? 'active bg-white/5 text-white' : ''}">
      ${renderAvatar(displayAvatar, hexColor)}
      <div class="ml-3 flex-auto">
        <p id="${labelId}" class="text-sm font-medium text-gray-300">${escapeHtml(p.name)}</p>
        ${p.notes ? `<p class="text-xs text-gray-400">${escapeHtml(p.notes)}</p>` : ''}
      </div>
    </a>
  `
}
