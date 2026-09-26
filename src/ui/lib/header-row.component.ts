/**
 * HeaderRowComponent - Encapsulates header row rendering and event handling
 * Extends the base Component class for lifecycle management
 */

import { headerNameError, headerValueError } from '../../lib/header-validation'
import type { HeaderOp } from '../../lib/types'
import { buildHeaderRowHTML } from '../components/headers/header-row.render'
import { Component } from './component'

export interface HeaderRowCallbacks {
  onChange: (id: string, field: 'header' | 'value' | 'enabled', value: string | boolean) => void
  onDelete: (id: string) => void
}

export class HeaderRowComponent extends Component {
  private drafts = new Set<'header' | 'value'>()
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

    for (const field of ['header', 'value'] as const) {
      this.on('input', `[data-role="${field}"]`, (e) => {
        const value = (e.target as HTMLInputElement).value
        const error = field === 'header' ? headerNameError(value) : headerValueError(value)
        this.showError(field, error)
        if (field === 'header') this.drafts.add(field)
        else if (!error) this.callbacks.onChange(this.header.id, field, value)
      })
      // Text inputs discard line breaks before input fires. Reject the original
      // paste so a malformed header cannot silently become a different value.
      this.on('paste', `[data-role="${field}"]`, (e) => {
        const pasted = (e as ClipboardEvent).clipboardData?.getData('text/plain')
        if (!pasted || !/[\r\n]/.test(pasted)) return
        e.preventDefault()
        this.showError(field, 'Paste one line only. The pasted text was not inserted.')
      })
    }

    // A valid prefix ("Bad") may become an invalid completed name ("Bad Header").
    // Keep every name draft local until the user finishes the edit.
    this.on('change', '[data-role="header"]', () => this.commitName())
    this.on('keydown', '[data-role="header"]', (e) => {
      const event = e as KeyboardEvent
      if (event.key === 'Enter' && !event.isComposing) this.commitName()
    })

    // Handle delete button
    this.on('click', '[data-action="removeHeader"]', () => {
      this.callbacks.onDelete(this.header.id)
    })
  }

  private commitName(): void {
    const input = this.el!.querySelector<HTMLInputElement>('[data-role="header"]')!
    const error = headerNameError(input.value)
    this.showError('header', error)
    if (!error && input.value !== this.header.header)
      this.callbacks.onChange(this.header.id, 'header', input.value)
  }

  private showError(field: 'header' | 'value', error: string | null): void {
    const input = this.el!.querySelector<HTMLInputElement>(`[data-role="${field}"]`)!
    const feedback = this.el!.querySelector<HTMLElement>(`[data-role="${field}Feedback"]`)!
    if (error) this.drafts.add(field)
    else this.drafts.delete(field)
    input.setAttribute('aria-invalid', String(!!error))
    feedback.hidden = !error
    feedback.textContent = error
      ? `${error} Last saved ${field === 'header' ? 'name' : 'value'} kept.`
      : ''
  }

  /**
   * Refresh saved fields without replacing focused inputs or unsaved drafts.
   */
  updateHeader(header: HeaderOp): void {
    this.header = header
    if (!this.el) return
    // Update saved fields in place: replacing the row would lose focus and
    // unsaved drafts when another header is added, sorted, or toggled.
    for (const field of ['header', 'value'] as const) {
      const input = this.el.querySelector<HTMLInputElement>(`[data-role="${field}"]`)!
      if (!this.drafts.has(field) && input.value !== header[field]) input.value = header[field]
    }
    const toggle = this.el.querySelector<HTMLElement & { checked: boolean }>(
      '[data-role="enabled"]'
    )!
    toggle.checked = header.enabled !== false
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
