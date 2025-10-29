/**
 * MatcherTableComponent - Manages multiple matcher row components in a table
 * Handles mounting, updating, and unmounting individual matcher rows
 */

import { Matcher } from '../../lib/types'
import { MatcherRowComponent, MatcherRowCallbacks } from './matcher-row.component'

export class MatcherTableComponent {
  private matchers = new Map<string, MatcherRowComponent>()

  constructor(
    private container: HTMLElement,
    private callbacks: MatcherRowCallbacks
  ) {}

  /**
   * Render matchers - mount new ones, update changed ones, unmount removed ones
   */
  render(matchers: Matcher[]): void {
    const newIds = new Set(matchers.map((m) => m.id))

    // Unmount matchers that are no longer in the list
    for (const [id, component] of this.matchers) {
      if (!newIds.has(id)) {
        component.unmount()
        this.matchers.delete(id)
      }
    }

    // Clear container and mount/update matchers in order
    this.container.innerHTML = ''

    matchers.forEach((matcher) => {
      let component = this.matchers.get(matcher.id)

      if (!component) {
        // Mount new matcher
        component = new MatcherRowComponent(matcher, this.callbacks)
        component.mount(this.container)
        this.matchers.set(matcher.id, component)
      } else {
        // Update existing matcher and remount it
        component.updateMatcher(matcher)
        this.container.appendChild(component.getElement()!)
      }
    })
  }

  /**
   * Get a specific matcher component by ID
   */
  getComponent(id: string): MatcherRowComponent | undefined {
    return this.matchers.get(id)
  }

  /**
   * Unmount all matchers and clear the list
   */
  unmountAll(): void {
    for (const component of this.matchers.values()) {
      component.unmount()
    }
    this.matchers.clear()
    this.container.innerHTML = ''
  }

  /**
   * Get count of mounted matchers
   */
  getCount(): number {
    return this.matchers.size
  }

  /**
   * Check if a specific matcher is mounted
   */
  isMounted(id: string): boolean {
    const component = this.matchers.get(id)
    return component ? component.isMounted() : false
  }
}
