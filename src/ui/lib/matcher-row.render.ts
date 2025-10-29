/**
 * Shared matcher row HTML template
 * Single source of truth for matcher row rendering across components and templates
 */
import { ghostButton } from '../components/ghost-button'
import trashIcon from '../icons/trash.svg?raw'
import { escapeHtml } from '../utils'

interface MatcherRowOptions {
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
    <div class="mt-2 flex items-center gap-2" data-mid="${m.id}">
      <div class="flex flex-1 items-center rounded-md bg-white/5 outline-1 -outline-offset-1 outline-gray-600 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-blue-500">
        <input
          type="text"
          placeholder="Leave empty for all domains"
          value="${escapeHtml(displayUrlFilter)}"
          data-role="urlFilter"
          class="block min-w-0 flex-1 bg-white/5 py-1.5 pl-3 pr-3 text-sm text-text placeholder:text-gray-500 focus:outline-none"
        />
        <div class="grid shrink-0 grid-cols-1 focus-within:relative">
          <select
            data-role="types"
            aria-label="Request type"
            class="col-start-1 row-start-1 appearance-none rounded-r-md bg-white/5 py-1.5 pr-7 pl-3 text-sm text-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
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
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-400">
            <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
          </svg>
        </div>
      </div>
      ${ghostButton({
        icon: trashIcon,
        action: 'removeMatcher',
        title: 'Remove matcher',
        variant: 'delete',
        circle: true,
      })}
    </div>
  `
}
