/**
 * Icon button template function
 * Reusable icon button with configurable icon and action
 */
import { escapeHtml } from '../utils'

export interface IconButtonOptions {
  icon: string // Raw SVG string
  action: string // data-action value
  title: string
  variant?: 'delete' | 'default' // delete = red hover, default = standard
  circle?: boolean // Make button circular
}

/**
 * Build an icon button with flexible icon and styling
 * Used for delete, action, and control buttons
 */
export function iconButton(options: IconButtonOptions): string {
  const { icon, action, title, variant = 'default', circle = false } = options

  const variantClasses =
    variant === 'delete'
      ? 'text-gray-400 hover:text-danger'
      : 'text-gray-400 hover:text-gray-300'

  const shapeClasses = circle ? 'w-8 h-8 rounded-full' : 'p-1.5 rounded-md'

  return `
    <button
      class="flex items-center justify-center bg-transparent hover:bg-white/10 ${shapeClasses} ${variantClasses} transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      data-action="${escapeHtml(action)}"
      title="${escapeHtml(title)}"
    >
      <span class="inline-flex items-center justify-center w-4 h-4">${icon}</span>
    </button>
  `
}
