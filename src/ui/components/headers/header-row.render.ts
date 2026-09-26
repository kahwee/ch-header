/**
 * Shared header row HTML template
 * Single source of truth for header row rendering across components and templates
 */

import { escapeHtml } from '../../core/utils'
import trashIcon from '../../icons/trash.svg?raw'
import { ghostButton } from '../buttons/ghost-button'

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
    <tr class="header-row" data-hid="${h.id}" data-kind="${kind}">
      <td class="header-row__toggle">
        <ch-checkbox
          data-role="enabled"
          ${isEnabled ? 'checked' : ''}
          title="Enable/disable this header"
        ></ch-checkbox>
      </td>
      <td class="header-row__fields">
        <div class="header-row__grid">
          <div class="header-row__field">
            <input
              type="text"
              class="field field--header-name"
              aria-label="${kind === 'req' ? 'Request' : 'Response'} header name"
              aria-describedby="${escapeHtml(`${kind}-${h.id}-header-feedback`)}"
              data-role="header"
              placeholder="Header name (e.g. X-Custom-Header)"
              value="${escapeHtml(h.header || '')}"
            />
            <p id="${escapeHtml(`${kind}-${h.id}-header-feedback`)}" class="header-row__feedback" data-role="headerFeedback" aria-live="polite" hidden></p>
          </div>
          <div class="header-row__field">
            <input
              type="text"
              class="field field--header-value"
              aria-label="${kind === 'req' ? 'Request' : 'Response'} header value"
              aria-describedby="${escapeHtml(`${kind}-${h.id}-value-feedback`)}"
              data-role="value"
              placeholder="Value"
              value="${escapeHtml(h.value || '')}"
            />
            <p id="${escapeHtml(`${kind}-${h.id}-value-feedback`)}" class="header-row__feedback" data-role="valueFeedback" aria-live="polite" hidden></p>
          </div>
        </div>
      </td>
      <td class="header-row__actions">
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
