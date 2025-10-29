/**
 * MatcherTableComponent - Manages multiple matcher row components in a table
 * Inherits from generic TableListComponent base class
 */

import { Matcher } from '../../lib/types'
import { MatcherRowComponent, MatcherRowCallbacks } from './matcher-row.component'
import { TableListComponent } from './table-list.component'

export class MatcherTableComponent extends TableListComponent<Matcher, MatcherRowComponent> {
  constructor(
    container: HTMLElement,
    private callbacks: MatcherRowCallbacks
  ) {
    super(container)
  }

  /**
   * Create a new matcher row component
   */
  protected createComponent(matcher: Matcher): MatcherRowComponent {
    return new MatcherRowComponent(matcher, this.callbacks)
  }

  /**
   * Update an existing matcher row component
   */
  protected updateComponent(component: MatcherRowComponent, matcher: Matcher): void {
    component.updateMatcher(matcher)
  }
}
