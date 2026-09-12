/**
 * Shared menu item HTML template
 * Single source of truth for menu item rendering across components and templates
 */
import { escapeHtml } from '../../core/utils'

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

  const titleAttr = title ? `title="${escapeHtml(title)}"` : ''

  return `<button type="button" data-action="${escapeHtml(action)}" class="menu-item ${variant === 'delete' ? 'menu-item--danger' : ''}" ${titleAttr}>${escapeHtml(label)}</button>`
}
