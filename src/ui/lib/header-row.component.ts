/**
 * HeaderRowComponent - Encapsulates header row rendering and event handling
 * Extends the base Component class for lifecycle management
 */

import { Component } from './component'
import { HeaderOp } from '../../lib/types'
import { buildHeaderRowHTML } from './header-row.render'

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
    return buildHeaderRowHTML({
      id: this.header.id,
      header: this.header.header,
      value: this.header.value,
      enabled: this.header.enabled,
      kind: this.isRequest ? 'req' : 'res',
    })
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
