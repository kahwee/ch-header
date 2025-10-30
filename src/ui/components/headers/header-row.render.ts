/**
 * Shared header row HTML template
 * Single source of truth for header row rendering across components and templates
 */
import { ghostButton } from '../buttons/ghost-button'
import trashIcon from '../../icons/trash.svg?raw'
import { escapeHtml } from '../../core/utils'

interface HeaderRowOptions {
  id: string
  header: string
  value?: string
  enabled?: boolean
  kind?: 'req' | 'res'
}

/**
 * Build a complete header row HTML string
 * Used by both HeaderRowComponent and headerRow template function
 */
export function buildHeaderRowHTML(h: HeaderRowOptions): string {
  const isEnabled = h.enabled !== false
  const kind = h.kind || 'req'

  return `
    <tr class="hover:bg-white/3 transition-colors" data-hid="${h.id}" data-kind="${kind}">
      <td class="text-sm whitespace-nowrap sm:pl-0 w-8 items-center justify-center pb-px">
        <ch-checkbox
          data-role="enabled"
          ${isEnabled ? 'checked' : ''}
          title="Enable/disable this header"
        ></ch-checkbox>
      </td>
      <td class="text-sm pb-px">
        <div class="grid grid-cols-2">
          <div class="-mt-px -mr-px">
            <input
              type="text"
              class="w-full rounded-l-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
              data-role="header"
              placeholder="Header name (e.g. X-Custom-Header)"
              value="${escapeHtml(h.header || '')}"
            />
          </div>
          <div class="-mt-px">
            <input
              type="text"
              class="w-full rounded-r-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
              data-role="value"
              placeholder="Value"
              value="${escapeHtml(h.value || '')}"
            />
          </div>
        </div>
      </td>
      <td class="text-sm whitespace-nowrap sm:pr-0 w-10 text-right align-middle pl-0.5 pb-px">
        ${ghostButton({
          icon: trashIcon,
          action: 'removeHeader',
          title: 'Delete header',
          variant: 'delete',
          circle: true,
        })}
      </td>
    </tr>
  `
}
