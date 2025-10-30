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

  const dropdownMenu = `<el-dropdown class="inline-block">
    <button class="flex items-center rounded-md text-gray-400 hover:text-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 p-1" title="${optionsTitle}">
      <svg viewBox="0 0 20 20" fill="currentColor" class="size-5">
        <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
      </svg>
    </button>
    <el-menu anchor="bottom end" popover class="w-48 origin-top-right rounded-md bg-stone-800 outline-1 -outline-offset-1 outline-white/10 transition transition-discrete [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in">
      <div class="py-1">
        ${opts.menuItems.map((item) => `<button type="button" data-action="${item.action}" class="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white focus:outline-hidden">${item.label}</button>`).join('')}
      </div>
    </el-menu>
  </el-dropdown>`

  return `<div class="relative flex items-center justify-between">
    <span class="bg-bg pr-3 text-sm font-semibold text-white whitespace-nowrap">${opts.title}</span>
    <div class="flex w-full items-center gap-2">
      <div aria-hidden="true" class="w-full border-t border-white/15"></div>
      <button id="${opts.addButtonId}" class="relative inline-flex items-center rounded-md px-1.5 py-1 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 text-xs bg-blue-500 text-white hover:bg-blue-600 focus-visible:outline-blue-500" title="${opts.addButtonTitle}">
        <span class="inline-flex items-center justify-center w-3.5 h-3.5"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></span>
      </button>
      ${dropdownMenu}
    </div>
  </div>`
}
