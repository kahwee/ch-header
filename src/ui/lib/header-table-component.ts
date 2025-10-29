/**
 * HeaderTableComponent - Manages multiple header row components in a table
 * Handles mounting, updating, and unmounting individual header rows
 * Supports both request and response headers
 */

import { HeaderOp } from '../../lib/types'
import { HeaderRowComponent, HeaderRowCallbacks } from './header-row.component'

export class HeaderTableComponent {
  private headers = new Map<string, HeaderRowComponent>()
  private isRequest: boolean

  constructor(
    private container: HTMLElement,
    private callbacks: HeaderRowCallbacks,
    isRequest: boolean = true
  ) {
    this.isRequest = isRequest
  }

  /**
   * Render headers - mount new ones, update changed ones, unmount removed ones
   */
  render(headerList: HeaderOp[]): void {
    const newIds = new Set(headerList.map((h) => h.id))

    // Unmount headers that are no longer in the list
    for (const [id, component] of this.headers) {
      if (!newIds.has(id)) {
        component.unmount()
        this.headers.delete(id)
      }
    }

    // Clear container and mount/update headers in order
    this.container.innerHTML = ''

    headerList.forEach((header) => {
      let component = this.headers.get(header.id)

      if (!component) {
        // Mount new header
        component = new HeaderRowComponent(header, this.callbacks, this.isRequest)
        component.mount(this.container)
        this.headers.set(header.id, component)
      } else {
        // Update existing header and remount it
        component.updateHeader(header)
        this.container.appendChild(component.getElement()!)
      }
    })
  }

  /**
   * Get a specific header component by ID
   */
  getComponent(id: string): HeaderRowComponent | undefined {
    return this.headers.get(id)
  }

  /**
   * Unmount all headers and clear the list
   */
  unmountAll(): void {
    for (const component of this.headers.values()) {
      component.unmount()
    }
    this.headers.clear()
    this.container.innerHTML = ''
  }

  /**
   * Get count of mounted headers
   */
  getCount(): number {
    return this.headers.size
  }

  /**
   * Check if a specific header is mounted
   */
  isMounted(id: string): boolean {
    const component = this.headers.get(id)
    return component ? component.isMounted() : false
  }

  /**
   * Check if this table manages request or response headers
   */
  getHeaderType(): 'request' | 'response' {
    return this.isRequest ? 'request' : 'response'
  }
}
