/**
 * Matcher row component
 */
import trashIcon from '../icons/trash.svg?raw'
import { escapeHtml } from '../utils'

export function matcherRow(m: {
  id: string
  urlFilter: string
  label?: string
  resourceTypes?: string[]
}): string {
  const selectedTypes = m.resourceTypes || []
  // If urlFilter is "*", show empty in UI (means "all domains")
  const displayUrlFilter = m.urlFilter === '*' ? '' : m.urlFilter

  return `
    <div class="group flex gap-2 items-center p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors" data-mid="${m.id}">
      <input class="flex-[2] rounded-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500" data-role="urlFilter" placeholder="Leave empty for all domains" value="${escapeHtml(displayUrlFilter)}">
      <select class="flex-1 rounded-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer" data-role="types">
        <option value="">All request types</option>
        <option value="xmlhttprequest" ${selectedTypes.includes('xmlhttprequest') ? 'selected' : ''}>XHR/Fetch</option>
        <option value="script" ${selectedTypes.includes('script') ? 'selected' : ''}>Scripts</option>
        <option value="stylesheet" ${selectedTypes.includes('stylesheet') ? 'selected' : ''}>Stylesheets</option>
        <option value="image" ${selectedTypes.includes('image') ? 'selected' : ''}>Images</option>
        <option value="font" ${selectedTypes.includes('font') ? 'selected' : ''}>Fonts</option>
        <option value="document" ${selectedTypes.includes('document') ? 'selected' : ''}>Documents</option>
        <option value="sub_frame" ${selectedTypes.includes('sub_frame') ? 'selected' : ''}>Iframes</option>
      </select>
      <button class="flex-shrink-0 p-2 rounded-md bg-transparent hover:bg-white/10 text-text hover:text-danger transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" data-action="removeMatcher" title="Remove matcher">
        <span class="inline-flex items-center justify-center w-4 h-4">${trashIcon}</span>
      </button>
    </div>
  `
}
