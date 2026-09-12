/**
 * Shared section header HTML template
 * Single source of truth for section header rendering across components and templates
 */

export interface MenuItem {
  label: string
  action: string
}

export interface SectionHeaderOptions {
  title: string
  addButtonId: string
  addButtonTitle: string
  menuItems: MenuItem[]
}

/**
 * Build a section header with label, divider, add button, and dropdown menu
 * Used for consistent styling across Matchers, Request headers, and Response headers sections
 */
export function buildSectionHeaderHTML(opts: SectionHeaderOptions): string {
  const optionsTitle = `${opts.title} options`

  const dropdownMenu = `<div class="dropdown">
    <button type="button" class="icon-button dropdown__trigger" title="${optionsTitle}" aria-haspopup="menu" aria-expanded="false">
      <svg viewBox="0 0 20 20" fill="currentColor" class="icon-button__icon">
        <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
      </svg>
    </button>
    <div class="dropdown__menu" role="menu" hidden>
      <div>
        ${opts.menuItems.map((item) => `<button type="button" data-action="${item.action}" class="menu-item" role="menuitem">${item.label}</button>`).join('')}
      </div>
    </div>
  </div>`

  return `<div class="section-header">
    <h2 class="section-header__title">${opts.title}</h2>
    <div aria-hidden="true" class="section-header__rule"></div>
    <div class="section-header__actions">
      <button id="${opts.addButtonId}" class="button button--primary button--sm" title="${opts.addButtonTitle}">
        <span class="button__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></span>
        <span>Add</span>
      </button>
      ${dropdownMenu}
    </div>
  </div>`
}
