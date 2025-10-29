/**
 * HeaderTableComponent - Manages multiple header row components in a table
 * Inherits from generic TableListComponent base class
 * Supports both request and response headers
 */

import { HeaderOp } from '../../lib/types'
import { HeaderRowComponent, HeaderRowCallbacks } from './header-row.component'
import { TableListComponent } from './table-list.component'

export class HeaderTableComponent extends TableListComponent<HeaderOp, HeaderRowComponent> {
  private isRequest: boolean

  constructor(
    container: HTMLElement,
    private callbacks: HeaderRowCallbacks,
    isRequest: boolean = true
  ) {
    super(container)
    this.isRequest = isRequest
  }

  /**
   * Create a new header row component
   */
  protected createComponent(header: HeaderOp): HeaderRowComponent {
    return new HeaderRowComponent(header, this.callbacks, this.isRequest)
  }

  /**
   * Update an existing header row component
   */
  protected updateComponent(component: HeaderRowComponent, header: HeaderOp): void {
    component.updateHeader(header)
  }

  /**
   * Check if this table manages request or response headers
   */
  getHeaderType(): 'request' | 'response' {
    return this.isRequest ? 'request' : 'response'
  }
}
