/**
 * Shared matcher row HTML template
 * Single source of truth for matcher row rendering across components and templates
 */
import { ghostButton } from '../buttons/ghost-button'
import trashIcon from '../../icons/trash.svg?raw'
import { escapeHtml } from '../../core/utils'

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
    <div class="matcher-row" data-mid="${m.id}">
      <div class="matcher-row__fields">
        <input
          type="text"
          placeholder="Leave empty for all domains"
          value="${escapeHtml(displayUrlFilter)}"
          data-role="urlFilter"
          class="field matcher-row__url"
        />
        <div class="matcher-row__type">
          <select
            data-role="types"
            aria-label="Request type"
            class="field matcher-row__select"
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
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="matcher-row__chevron">
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
