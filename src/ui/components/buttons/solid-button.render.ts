/**
 * Shared solid button HTML template
 * Single source of truth for solid button rendering across components and templates
 */

export interface SolidButtonOptions {
  text?: string
  icon?: string
  id?: string
  title?: string
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary'
  action?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

/**
 * Build a solid button with filled background
 * Used by both solidButton template and for hardcoded button consolidation
 */
export function buildSolidButtonHTML(options: SolidButtonOptions): string {
  const {
    text,
    icon,
    id,
    title,
    type = 'button',
    variant = 'primary',
    action,
    size = 'md',
    disabled = false,
  } = options

  const idAttr = id ? `id="${id}"` : ''
  const titleAttr = title ? `title="${title}"` : ''
  const actionAttr = action ? `data-action="${action}"` : ''
  const disabledAttr = disabled ? 'disabled' : ''

  return `
    <button type="${type}" ${idAttr} ${titleAttr} ${actionAttr} ${disabledAttr} class="button button--${variant} button--${size} ${icon && !text ? 'button--icon-only' : ''}">
      ${icon ? `<span class="button__icon">${icon}</span>` : ''}
      ${text ? `${text}` : ''}
    </button>
  `
}
