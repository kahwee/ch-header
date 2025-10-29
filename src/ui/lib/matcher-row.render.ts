/**
 * Shared matcher row HTML template
 * Single source of truth for matcher row rendering across components and templates
 */
import trashIcon from '../icons/trash.svg?raw'
import { escapeHtml } from '../utils'

export interface MatcherRowOptions {
  id: string
  urlFilter: string
  resourceTypes?: string[]
}

/**
 * Build a complete matcher row HTML string
 * Used by both MatcherRowComponent and matcherRow template function
 */
export function buildMatcherRowHTML(m: MatcherRowOptions): string {
  const selectedTypes = m.resourceTypes || []
  // If urlFilter is "*", show empty in UI (means "all domains")
  const displayUrlFilter = m.urlFilter === '*' ? '' : m.urlFilter

  return `
    <tr class="hover:bg-white/3 transition-colors" data-mid="${m.id}">
      <td class="text-sm">
        <input
          class="w-full rounded-l-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
          data-role="urlFilter"
          placeholder="Leave empty for all domains"
          value="${escapeHtml(displayUrlFilter)}"
        />
      </td>
      <td class="text-sm">
        <select
          class="w-full rounded-r-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer"
          data-role="types"
        >
          <option value="">All request types</option>
          <option value="xmlhttprequest" ${selectedTypes.includes('xmlhttprequest') ? 'selected' : ''}>XHR/Fetch</option>
          <option value="script" ${selectedTypes.includes('script') ? 'selected' : ''}>Scripts</option>
          <option value="stylesheet" ${selectedTypes.includes('stylesheet') ? 'selected' : ''}>Stylesheets</option>
          <option value="image" ${selectedTypes.includes('image') ? 'selected' : ''}>Images</option>
          <option value="font" ${selectedTypes.includes('font') ? 'selected' : ''}>Fonts</option>
          <option value="document" ${selectedTypes.includes('document') ? 'selected' : ''}>Documents</option>
          <option value="sub_frame" ${selectedTypes.includes('sub_frame') ? 'selected' : ''}>Iframes</option>
        </select>
      </td>
      <td class="text-sm whitespace-nowrap sm:pr-0 w-10 items-center justify-center">
        <button
          class="p-1.5 rounded-md bg-transparent hover:bg-white/10 text-gray-400 hover:text-danger transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          data-action="removeMatcher"
          title="Remove matcher"
        >
          <span class="inline-flex items-center justify-center w-4 h-4">${trashIcon}</span>
        </button>
      </td>
    </tr>
  `
}
