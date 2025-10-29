/**
 * Generic TableListComponent base class
 * Manages rendering of table row components with smart mount/update/unmount logic
 * Eliminates duplication across MatcherTableComponent and HeaderTableComponent
 */

interface TableRowComponent {
  mount(container: HTMLElement): void
  unmount(): void
  isMounted(): boolean
  getElement(): HTMLElement | null
}

/**
 * Generic base class for managing collections of table row components
 * T = the data type (Matcher, HeaderOp, etc.)
 * R = the row component type
 */
export abstract class TableListComponent<T extends { id: string }, R extends TableRowComponent> {
  protected items = new Map<string, R>()

  constructor(protected container: HTMLElement) {}

  /**
   * Render items - mount new ones, update changed ones, unmount removed ones
   */
  render(itemList: T[]): void {
    const newIds = new Set(itemList.map((item) => item.id))

    // Unmount items that are no longer in the list
    for (const [id, component] of this.items) {
      if (!newIds.has(id)) {
        component.unmount()
        this.items.delete(id)
      }
    }

    // Clear container and mount/update items in order
    this.container.innerHTML = ''

    itemList.forEach((item) => {
      let component = this.items.get(item.id)

      if (!component) {
        // Mount new item
        component = this.createComponent(item)
        component.mount(this.container)
        this.items.set(item.id, component)
      } else {
        // Update existing item and remount it
        this.updateComponent(component, item)
        this.container.appendChild(component.getElement()!)
      }
    })
  }

  /**
   * Factory method - subclasses implement to create their specific component type
   */
  protected abstract createComponent(item: T): R

  /**
   * Update method - subclasses implement to handle their specific update logic
   */
  protected abstract updateComponent(component: R, item: T): void

  /**
   * Get a specific component by ID
   */
  getComponent(id: string): R | undefined {
    return this.items.get(id)
  }

  /**
   * Unmount all items and clear the list
   */
  unmountAll(): void {
    for (const component of this.items.values()) {
      component.unmount()
    }
    this.items.clear()
    this.container.innerHTML = ''
  }

  /**
   * Get count of mounted items
   */
  getCount(): number {
    return this.items.size
  }

  /**
   * Check if a specific item is mounted
   */
  isMounted(id: string): boolean {
    const component = this.items.get(id)
    return component ? component.isMounted() : false
  }
}
