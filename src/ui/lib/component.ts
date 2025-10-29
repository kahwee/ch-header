/**
 * Lightweight Component Base Class for Chrome Extension UI
 * Provides lifecycle management and event delegation without framework overhead
 */

export type EventHandler = (e: Event) => void
type EventListener = { eventType: string; selector: string; handler: EventHandler }

export abstract class Component {
  protected el: HTMLElement | null = null
  private listeners: EventListener[] = []

  constructor(public id: string) {}

  /**
   * Return HTML string to render
   */
  abstract render(): string

  /**
   * Called after mount - override to set up event listeners
   */
  protected setupHandlers(): void {}

  /**
   * Mount component into parent element
   */
  mount(parent: HTMLElement): void {
    const html = this.render()

    // For table rows, use a temporary table/tbody to parse correctly
    let el: HTMLElement | null = null
    if (html.trim().startsWith('<tr')) {
      const tbody = document.createElement('tbody')
      document.createElement('table').appendChild(tbody) // Ensure proper DOM context
      tbody.innerHTML = html
      el = tbody.firstElementChild as HTMLElement
    } else {
      const temp = document.createElement('div')
      temp.innerHTML = html
      el = temp.firstElementChild as HTMLElement
    }

    if (!el) {
      throw new Error(`Component ${this.id}: render() must return valid HTML string`)
    }

    this.el = el
    this.el.setAttribute('data-component', this.id)
    parent.appendChild(this.el)
    this.setupHandlers()
  }

  /**
   * Register event handler with delegation
   * @param eventType - 'click', 'input', 'change', etc.
   * @param selector - CSS selector to match delegated events
   * @param handler - Event handler callback
   */
  protected on(eventType: string, selector: string, handler: EventHandler): void {
    if (!this.el) {
      console.warn(`Component ${this.id}: Cannot add listener before mount`)
      return
    }

    const listener = (e: Event) => {
      const target = e.target as Element
      if (target?.closest(selector)) {
        handler(e)
      }
    }

    this.listeners.push({ eventType, selector, handler: listener })
    this.el.addEventListener(eventType, listener)
  }

  /**
   * Update component with new HTML, preserving element reference
   */
  protected updateContent(html: string): void {
    if (!this.el) return

    // Create temp element from new HTML (handle table rows specially)
    let newEl: Element | null = null
    if (html.trim().startsWith('<tr')) {
      const tbody = document.createElement('tbody')
      document.createElement('table').appendChild(tbody) // Ensure proper DOM context
      tbody.innerHTML = html
      newEl = tbody.firstElementChild
    } else {
      const temp = document.createElement('div')
      temp.innerHTML = html
      newEl = temp.firstElementChild
    }

    if (!newEl) {
      console.warn(`Component ${this.id}: updateContent() received invalid HTML`)
      return
    }

    // Remove all old event listeners before updating
    this.listeners.forEach(({ eventType, handler }) => {
      this.el?.removeEventListener(eventType, handler)
    })
    this.listeners = []

    // Copy attributes from new element (preserve data attributes, classes)
    Array.from(newEl.attributes).forEach((attr) => {
      this.el!.setAttribute(attr.name, attr.value)
    })

    // Update only innerHTML to preserve element reference
    this.el.innerHTML = newEl.innerHTML

    // Re-bind event listeners after DOM update
    this.setupHandlers()
  }

  /**
   * Unmount component and clean up listeners
   */
  unmount(): void {
    if (!this.el) return

    // Remove all event listeners
    this.listeners.forEach(({ eventType, handler }) => {
      this.el?.removeEventListener(eventType, handler)
    })
    this.listeners = []

    // Remove from DOM
    this.el.remove()
    this.el = null
  }

  /**
   * Check if component is mounted
   */
  isMounted(): boolean {
    return this.el !== null && this.el.isConnected
  }

  /**
   * Get the mounted DOM element (for advanced use cases)
   */
  getElement(): HTMLElement | null {
    return this.el
  }
}
