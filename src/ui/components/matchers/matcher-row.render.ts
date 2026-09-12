/**
 * Shared matcher row HTML template
 * Single source of truth for matcher row rendering across components and templates
 */

import { readURLRule } from '../../../lib/url-rule'
import { escapeHtml } from '../../core/utils'
import trashIcon from '../../icons/trash.svg?raw'
import { ghostButton } from '../buttons/ghost-button'

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
  const { mode, value: displayUrlFilter } = readURLRule(m.urlFilter)

  return `
    <div class="matcher-row" data-mid="${m.id}">
      <div class="matcher-row__fields">
        <select data-role="mode" class="field matcher-row__mode" aria-label="URL rule mode">
          <option value="site" ${mode === 'site' ? 'selected' : ''}>Site</option>
          <option value="pattern" ${mode === 'pattern' ? 'selected' : ''}>URL pattern</option>
          <option value="regex" ${mode === 'regex' ? 'selected' : ''}>Regex</option>
          <option value="all" ${mode === 'all' ? 'selected' : ''}>All allowed sites</option>
        </select>
        <input
          type="text"
          aria-label="URL rule value"
          ${mode === 'all' ? 'disabled' : ''}
          aria-describedby="urlRulesHelp"
          title="Site: hostname only. URL pattern: paths and * wildcards. Regex: Chrome-supported expression without a regex: prefix."
          placeholder="${mode === 'site' ? 'api.example.com' : mode === 'regex' ? '^https://api\\.example\\.com/' : mode === 'all' ? 'Every allowed site' : 'https://example.com/api/*'}"
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
            <option value="main_frame" ${selectedTypes.includes('main_frame') || selectedTypes.includes('document') ? 'selected' : ''}>Documents</option>
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
      <p data-role="ruleFeedback" class="matcher-row__feedback" aria-live="polite">${mode === 'all' ? 'Headers may be sent to any URL within this profile’s allowed sites.' : ''}</p>
    </div>
  `
}
