import { profileActionsTemplate } from './profile-actions-template'
/**
 * Shared popup HTML template
 * Used by both popup.html (rendered) and Storybook stories (with mocks)
 */
import { solidButton } from '../components/buttons/solid-button'
import { renderAvatar } from '../components/common/avatar'
import { menuItem } from '../components/menus/menu-item'
import { sectionHeader } from '../components/sections/section-header'
import folderPlusIcon from '../icons/folder-plus.svg?raw'
import plusIcon from '../icons/plus.svg?raw'
import logo from '../../../public/icons/logo.svg?raw'
import searchIcon from '../icons/search.svg?raw'
import { getProfileColor, PROFILE_COLORS } from './profile-colors'
import { escapeHtml } from './utils'

export { PROFILE_COLORS as COLOR_PALETTE } from './profile-colors'

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
    <section class="editor-section editor-section--headers">
      ${description ? `<p class="editor-section__description">${description}</p>` : ''}
      ${sectionHeader({
        title,
        addButtonId,
        addButtonTitle: 'Add header',
        menuItems: [
          { label: 'Sort A-Z', action: sortAction },
          { label: 'Clear all', action: clearAction },
        ],
      })}
      <div class="header-column-labels" aria-hidden="true"><span>Header name</span><span>Value</span></div>
      <p class="header-empty">No ${type === 'req' ? 'request' : 'response'} headers. Use Add to set one.</p>
      <div class="header-table-wrap">
        <div>
          <div>
            <table class="header-table">
              <tbody id="${containerId}"></tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `
}

/**
 * Generate the sidebar command palette template
 * Used by both the extension popup and Storybook stories
 */
export function getSidebarTemplate(): string {
  return `<aside class="sidebar">
    <div class="sidebar__brand">
      <div class="sidebar__brand-copy"><span class="brand-mark" aria-hidden="true">${logo}</span><strong>ChHeader</strong></div>
      ${solidButton({ id: 'footerNewProfile', text: 'New', icon: plusIcon, variant: 'secondary', size: 'sm', title: 'Add new profile' })}
    </div>
    <div class="sidebar__toolbar">
      <div class="search-field">
        <input
          id="sidebarSearch"
          type="text"
          autofocus
          aria-label="Search profiles"
          placeholder="Search profiles…"
          class="search-field__input"
          autocomplete="off"
        />
        <span class="search-field__icon">
          ${searchIcon}
        </span>
      </div>
    </div>
    <div class="sidebar__list">
        <div id="profileList" class="profile-list"></div>
        <p id="emptyProfileList" class="sidebar-empty" hidden>Your profiles will appear here.</p>
        <div hidden id="searchResults" class="search-results"></div>
        <div id="noResults" hidden class="empty-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="empty-search__icon">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="empty-search__title">No results found</p>
          <p class="empty-search__copy">Try a different profile name or note.</p>
          <button id="clearProfileSearch" type="button" class="button button--secondary button--sm">Clear search</button>
        </div>
    </div>
    <footer class="sidebar__footer"><button type="button" data-action="importProfile" class="button button--secondary button--sm">Import</button><button type="button" data-action="exportAll" class="button button--secondary button--sm">Export all</button></footer>
  </aside>`
}

export function getPopupTemplate(options?: { containerClass?: string }): string {
  const containerClass = options?.containerClass || ''
  return `<div id="app" class="app-shell ${containerClass}">
    <main class="workspace">
      ${getSidebarTemplate()}
      <section class="editor">
        <div id="detailEmpty" class="empty-state">
          ${folderPlusIcon}
          <h3>Make your first profile</h3>
          <p>A profile groups the headers you want to change<br />and the sites where they apply.</p>
          <ol class="empty-state__steps">
            <li>Choose a site or URL rule.</li>
            <li>Add a request or response header.</li>
            <li>Turn the profile on when you’re ready.</li>
          </ol>
          <div class="empty-state__actions">
            ${solidButton({ id: 'newProfileEmpty', text: 'Create profile', icon: plusIcon, variant: 'primary', size: 'md' })}
            <button type="button" data-action="importProfile" class="button button--secondary button--md">Import profiles…</button>
          </div>
          <p class="empty-state__reassurance">Profiles stay on this device. New profiles start off.</p>
        </div>
        <form id="detail" class="profile-editor hidden">
          <div class="profile-heading">
            <button id="profileAvatarBtn" type="button" popovertarget="colorPickerPopover" class="profile-avatar profile-avatar--button" style="background-color: #a8c7fa;" title="Choose profile color">
              <span id="profileAvatarInitials">P</span>
            </button>
            <div class="profile-heading__name">
              <input id="profileName" type="text" name="profileName" placeholder="Profile name" aria-label="Profile name" class="field field--profile-name" required />
            </div>
            <div class="dropdown">
              <button type="button" class="button button--secondary button--md dropdown__trigger" aria-haspopup="menu" aria-expanded="false">
                Options
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="button__icon">
                  <path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
              </button>
              <div class="dropdown__menu" role="menu" hidden>
                <div>
                  ${menuItem({ label: 'Import headers', action: 'importHeaders', title: 'Import headers from JSON' })}
                  ${menuItem({ label: 'Copy JSON', action: 'copy' })}
                  ${menuItem({ label: 'Export JSON…', action: 'export' })}
                </div>
                <div class="dropdown__group">
                  ${menuItem({ label: 'Duplicate', action: 'duplicate' })}
                  ${menuItem({ label: 'Delete', action: 'delete', variant: 'delete' })}
                </div>
              </div>
            </div>
          </div>

          <div id="colorPickerPopover" popover class="color-popover">
            <div class="color-popover__content">
              <div class="color-grid">
                ${PROFILE_COLORS.map(
                  (color) => `
                  <button
                    type="button"
                    data-color="${color.token}"
                    data-hex="${color.hex}"
                    class="color-option"
                    style="background-color: ${color.hex}; border: 2px solid rgba(255,255,255,0.2)"
                    title="${color.name}"
                    popovertarget="colorPickerPopover"
                    popovertargetaction="hide"
                  ></button>
                `
                ).join('')}
              </div>
              <div class="color-popover__initials">
                <label for="profileInitials">Avatar character</label>
                <input
                  id="profileInitials"
                  type="text"
                  maxlength="1"
                  placeholder="A"
                  class="field field--initials"
                />
              </div>
            </div>
          </div>
          <input type="file" id="importFile" accept=".json" style="display: none;" />
          <div class="profile-editor__body">
          <div class="profile-notes">
            <textarea id="profileNotes" name="profileNotes" rows="1" aria-label="Profile notes" class="field field--notes" placeholder="Describe what this profile changes…"></textarea>
          </div>

          ${headersSection('req', 'Request headers', '')}
          ${headersSection('res', 'Response headers', '')}

          <section class="editor-section">
            ${sectionHeader({
              title: 'URL rules',
              addButtonId: 'addMatcher',
              addButtonTitle: 'Add URL rule',
              menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
            })}
            <p id="urlRulesHelp" class="editor-section__hint">Site covers HTTP/HTTPS and subdomains. No rules: no requests.</p>
            <div id="matchers"></div>
          </section>

          </div>
          <footer class="profile-footer">
            <div class="profile-footer__status">
              <ch-checkbox id="enabled" data-role="enabled" aria-label="Enable this profile" switch></ch-checkbox>
              <div><strong id="profileEnabledStatus" aria-live="polite">Profile is off</strong><span>Changes save on edit · URL rules save on leaving the field</span></div>
            </div>
            <div>
              ${solidButton({ id: 'apply', text: 'Apply', type: 'submit', variant: 'primary', title: 'Reapply the enabled profile’s saved rules' })}
            </div>
          </footer>
        </form>
      </section>
    </main>
    ${profileActionsTemplate()}
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

  // Resolve the stored color token to its display value.
  const colorToken = p.color || 'blue'
  const hexColor = getProfileColor(colorToken).hex

  return `
    <a href="#" aria-labelledby="${labelId}" aria-describedby="status-${p.id}" aria-selected="${isActive}" data-id="${p.id}" class="profile-item ${isActive ? 'active' : ''}">
      ${renderAvatar(displayAvatar, hexColor)}
      <div class="profile-item__copy">
        <p id="${labelId}" class="profile-item__name">${escapeHtml(p.name)}</p>
        <p class="profile-item__meta"><span id="status-${p.id}" class="profile-status ${p.enabled ? 'profile-status--on' : ''}">${p.enabled ? 'On' : 'Off'}</span>${p.notes ? `<span class="profile-item__note">${escapeHtml(p.notes)}</span>` : ''}</p>
      </div>
    </a>
  `
}
