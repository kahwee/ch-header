/**
 * Ghost button component with transparent background
 * Used for secondary actions with icon only
 */
import { escapeHtml } from '../../core/utils'

export interface GhostButtonOptions {
  icon: string // Raw SVG string
  action: string // data-action value
  title: string
  variant?: 'delete' | 'default' // delete = red hover, default = standard
  circle?: boolean // Make button circular
}

/**
 * Build a ghost button with flexible icon and styling
 * Used for delete, action, and control buttons
 */
export function ghostButton(options: GhostButtonOptions): string {
  const { icon, action, title, variant = 'default', circle = false } = options

  const variantClass = variant === 'delete' ? 'icon-button--danger' : ''
  const shapeClass = circle ? 'icon-button--circle' : ''

  return `
    <button
      type="button"
      class="icon-button ${variantClass} ${shapeClass}"
      data-action="${escapeHtml(action)}"
      title="${escapeHtml(title)}"
    >
      <span class="icon-button__icon">${icon}</span>
    </button>
  `
}
