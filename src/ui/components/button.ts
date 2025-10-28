/**
 * Reusable button component
 */
export function actionButton(options: {
  text?: string
  icon?: string
  id?: string
  title?: string
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger' | 'delete'
  dataAction?: string
  size?: 'sm' | 'md'
  roundedDirection?: 'all' | 'right' // for delete button pairing
}): string {
  const {
    text,
    icon,
    id,
    title,
    type = 'button',
    variant = 'primary',
    dataAction,
    size = 'md',
    roundedDirection = 'all',
  } = options

  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-400 focus-visible:outline-blue-500',
    secondary: 'bg-stone-700 text-text hover:bg-stone-600 focus-visible:outline-stone-500',
    danger: 'bg-danger text-white hover:bg-red-600 focus-visible:outline-danger',
    delete: 'bg-white/5 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/10 focus:z-10',
  }

  const idAttr = id ? `id="${id}"` : ''
  const titleAttr = title ? `title="${title}"` : ''
  const dataActionAttr = dataAction ? `data-action="${dataAction}"` : ''

  // Rounded corners - delete variant uses right-only rounded corners
  const roundedClass =
    variant === 'delete' && roundedDirection === 'right' ? 'rounded-r-md' : 'rounded-md'

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

  // Delete variant uses fixed padding
  const padding = variant === 'delete' ? 'px-3 py-2' : sizeClasses[size].padding
  const sizes = { ...sizeClasses[size], padding }

  return `
    <button type="${type}" ${idAttr} ${titleAttr} ${dataActionAttr} class="relative inline-flex items-center ${sizes.gap} ${roundedClass} ${padding} font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${sizes.text} ${variantClasses[variant]}">
      ${icon ? `<span class="inline-flex items-center justify-center ${sizes.icon}">${icon}</span>` : ''}
      ${text ? `${text}` : variant === 'delete' ? '<span class="sr-only">Delete</span>' : ''}
    </button>
  `
}
