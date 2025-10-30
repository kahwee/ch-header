/**
 * Shared menu item HTML template
 * Single source of truth for menu item rendering across components and templates
 */
import { escapeHtml } from '../utils'

export interface MenuItemOptions {
  label: string
  action: string
  variant?: 'default' | 'delete'
  title?: string
}

/**
 * Build a menu item button with proper styling and escaping
 * Used in dropdown menus with proper hover and focus states
 */
export function buildMenuItemHTML(options: MenuItemOptions): string {
  const { label, action, variant = 'default', title } = options

  const variantClasses =
    variant === 'delete'
      ? 'text-red-400 hover:bg-white/5 hover:text-red-300 focus:bg-white/5 focus:text-red-300'
      : 'text-gray-300 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'

  const titleAttr = title ? `title="${escapeHtml(title)}"` : ''

  return `<button type="button" data-action="${escapeHtml(action)}" class="block w-full px-4 py-2 text-left text-sm ${variantClasses} focus:outline-hidden" ${titleAttr}>${escapeHtml(label)}</button>`
}
