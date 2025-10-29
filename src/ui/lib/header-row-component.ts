/**
 * HeaderRowComponent - Encapsulates header row rendering and event handling
 * Extends the base Component class for lifecycle management
 */

import { Component } from './component'
import { HeaderOp } from '../../lib/types'
import { escapeHtml } from '../utils'
import trashIcon from '../icons/trash.svg?raw'

export interface HeaderRowCallbacks {
  onChange: (id: string, field: 'header' | 'value' | 'enabled', value: string | boolean) => void
  onDelete: (id: string) => void
}

export class HeaderRowComponent extends Component {
  constructor(
    private header: HeaderOp,
    private callbacks: HeaderRowCallbacks,
    private isRequest: boolean = true
  ) {
    super(`header-row-${header.id}`)
  }

  render(): string {
    const kind = this.isRequest ? 'req' : 'res'
    const isEnabled = this.header.enabled !== false

    return `
      <tr class="hover:bg-white/3 transition-colors" data-hid="${this.header.id}" data-kind="${kind}">
        <td class="text-sm whitespace-nowrap sm:pl-0 w-8 items-center justify-center">
          <ch-checkbox
            data-role="enabled"
            ${isEnabled ? 'checked' : ''}
            title="Enable/disable this header"
          ></ch-checkbox>
        </td>
        <td class="text-sm">
          <div class="grid grid-cols-2">
            <div class="-mt-px -mr-px">
              <input
                type="text"
                class="w-full rounded-l-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
                data-role="header"
                placeholder="Header name (e.g. X-Custom-Header)"
                value="${escapeHtml(this.header.header || '')}"
              >
            </div>
            <div class="-mt-px">
              <input
                type="text"
                class="w-full rounded-r-md bg-white/5 px-3 py-2 text-sm text-text outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500"
                data-role="value"
                placeholder="Value"
                value="${escapeHtml(this.header.value || '')}"
              >
            </div>
          </div>
        </td>
        <td class="text-sm whitespace-nowrap sm:pr-0 w-10 items-center justify-center">
          <button
            class="p-1.5 rounded-md bg-transparent hover:bg-white/10 text-gray-400 hover:text-danger transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            data-action="removeHeader"
            title="Delete header"
          >
            <span class="inline-flex items-center justify-center w-4 h-4">${trashIcon}</span>
          </button>
        </td>
      </tr>
    `
  }

  protected setupHandlers(): void {
    // Handle enabled/disabled toggle
    this.on('change', '[data-role="enabled"]', (e) => {
      const checked = (e.target as HTMLInputElement).checked
      this.callbacks.onChange(this.header.id, 'enabled', checked)
    })

    // Handle header name changes
    this.on('input', '[data-role="header"]', (e) => {
      const value = (e.target as HTMLInputElement).value
      this.callbacks.onChange(this.header.id, 'header', value)
    })

    // Handle header value changes
    this.on('input', '[data-role="value"]', (e) => {
      const value = (e.target as HTMLInputElement).value
      this.callbacks.onChange(this.header.id, 'value', value)
    })

    // Handle delete button
    this.on('click', '[data-action="removeHeader"]', () => {
      this.callbacks.onDelete(this.header.id)
    })
  }

  /**
   * Update header data and re-render
   */
  updateHeader(header: HeaderOp): void {
    this.header = header
    this.updateContent(this.render())
  }

  /**
   * Get the current header data
   */
  getHeader(): HeaderOp {
    return this.header
  }

  /**
   * Get whether this is a request or response header
   */
  isRequestHeader(): boolean {
    return this.isRequest
  }
}
