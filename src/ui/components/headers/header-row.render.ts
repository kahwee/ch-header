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
              data-role="header"
              placeholder="Header name (e.g. X-Custom-Header)"
              value="${escapeHtml(h.header || '')}"
            />
          </div>
          <div class="header-row__field">
            <input
              type="text"
              class="field field--header-value"
              data-role="value"
              placeholder="Value"
              value="${escapeHtml(h.value || '')}"
            />
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
