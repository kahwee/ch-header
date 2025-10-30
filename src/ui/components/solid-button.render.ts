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

  const variantClasses = {
    primary: disabled
      ? 'bg-blue-400 text-white cursor-not-allowed opacity-60'
      : 'bg-blue-700 text-white hover:bg-blue-600 focus-visible:outline-blue-700',
    secondary: disabled
      ? 'bg-stone-500 text-text cursor-not-allowed opacity-60'
      : 'bg-stone-700 text-text hover:bg-stone-600 focus-visible:outline-stone-500',
  }

  const idAttr = id ? `id="${id}"` : ''
  const titleAttr = title ? `title="${title}"` : ''
  const actionAttr = action ? `data-action="${action}"` : ''
  const disabledAttr = disabled ? 'disabled' : ''

  // Size classes
  const sizeClasses = {
    sm: {
      padding: text ? 'px-1.5 py-1' : 'p-1',
      gap: text ? 'gap-x-1' : '',
      text: text ? 'text-xs' : '',
      icon: 'w-3.5 h-3.5',
    },
    md: {
      padding: text ? 'px-3 py-2.5' : 'p-1.5',
      gap: text ? 'gap-x-1.5' : '',
      text: text ? 'text-sm' : '',
      icon: 'w-4 h-4',
    },
  }

  const sizes = sizeClasses[size]

  return `
    <button type="${type}" ${idAttr} ${titleAttr} ${actionAttr} ${disabledAttr} class="relative inline-flex items-center ${sizes.gap} rounded-md ${sizes.padding} font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${sizes.text} ${variantClasses[variant]}">
      ${icon ? `<span class="inline-flex items-center justify-center ${sizes.icon}">${icon}</span>` : ''}
      ${text ? `${text}` : ''}
    </button>
  `
}
