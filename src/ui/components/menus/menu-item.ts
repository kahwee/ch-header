/**
 * Menu item template function
 * Delegates to buildMenuItemHTML() for single source of truth
 * Used for Storybook documentation and template rendering
 */
import { buildMenuItemHTML, type MenuItemOptions } from './menu-item.render'

export function menuItem(options: MenuItemOptions): string {
  return buildMenuItemHTML(options)
}

export type { MenuItemOptions }
