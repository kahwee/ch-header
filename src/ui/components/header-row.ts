/**
 * Header row component
 */
import trashIcon from '../icons/trash.svg?raw'
import { escapeHtml } from '../utils'

export function headerRow(h: {
  id: string
  header: string
  value?: string
  op: 'set' | 'append' | 'remove'
  enabled?: boolean
}): string {
  return `
    <tr class="hover:bg-white/3 transition-colors" data-hid="${h.id}" data-kind="req">
      <td class="text-sm whitespace-nowrap sm:pl-0 w-8 items-center justify-center">
        <ch-checkbox data-role="enabled" ${h.enabled !== false ? 'checked' : ''}></ch-checkbox>
      </td>
      <td class="text-sm">
        <div class="grid grid-cols-2">
          <div class="-mt-px -mr-px">
            <input type="text" data-role="header" placeholder="Header name (e.g. X-Custom-Header)" value="${escapeHtml(h.header || '')}" class="w-full rounded-l-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500" />
          </div>
          <div class="-mt-px">
            <input type="text" data-role="value" placeholder="Value" value="${escapeHtml(h.value || '')}" class="w-full rounded-r-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500" />
          </div>
        </div>
      </td>
      <td class="text-sm whitespace-nowrap sm:pr-0 w-10 items-center justify-center">
        <button data-action="removeHeader" title="Delete" class="p-1.5 rounded-md bg-transparent hover:bg-white/10 text-gray-400 hover:text-danger transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"><span class="inline-flex items-center justify-center w-4 h-4">${trashIcon}</span></button>
      </td>
    </tr>
  `
}
