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
    <div class="flex items-center gap-2 rounded-lg bg-white/3 hover:bg-white/5 p-3 transition-colors" data-hid="${h.id}" data-kind="req">
      <ch-checkbox data-role="enabled" ${h.enabled !== false ? 'checked' : ''}></ch-checkbox>
      <input type="text" data-role="header" placeholder="Header name (e.g. X-Custom-Header)" value="${escapeHtml(h.header || '')}" class="flex-1 rounded-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500" />
      <input type="text" data-role="value" placeholder="Value" value="${escapeHtml(h.value || '')}" class="flex-1 rounded-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500" />
      <button data-action="removeHeader" title="Delete" class="flex-shrink-0 p-2 rounded-md bg-transparent hover:bg-white/10 text-text hover:text-danger transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"><span class="inline-flex items-center justify-center w-4 h-4">${trashIcon}</span></button>
    </div>
  `
}
