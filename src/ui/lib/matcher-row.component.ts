/**
 * MatcherRowComponent - Encapsulates matcher row rendering and event handling
 * Extends the base Component class for lifecycle management
 */

import { Component } from './component'
import { Matcher } from '../../lib/types'
import { matcherRow } from '../components/matchers/matcher-row'

export interface MatcherRowCallbacks {
  onChange: (id: string, field: 'urlFilter' | 'types', value: string) => void
  onDelete: (id: string) => void
}

export class MatcherRowComponent extends Component {
  constructor(
    private matcher: Matcher,
    private callbacks: MatcherRowCallbacks
  ) {
    super(`matcher-row-${matcher.id}`)
  }

  render(): string {
    return matcherRow(this.matcher)
  }

  protected setupHandlers(): void {
    // Handle URL filter changes
    this.on('input', '[data-role="urlFilter"]', (e) => {
      const value = (e.target as HTMLInputElement).value
      // Convert empty string to "*" for "all domains"
      const urlFilter = value === '' ? '*' : value
      this.callbacks.onChange(this.matcher.id, 'urlFilter', urlFilter)
    })

    // Handle resource type changes
    this.on('change', '[data-role="types"]', (e) => {
      const select = e.target as HTMLSelectElement
      const value = select.value || ''
      this.callbacks.onChange(this.matcher.id, 'types', value)
    })

    // Handle delete button
    this.on('click', '[data-action="removeMatcher"]', () => {
      this.callbacks.onDelete(this.matcher.id)
    })
  }

  /**
   * Update matcher data and re-render
   */
  updateMatcher(matcher: Matcher): void {
    this.matcher = matcher
    this.updateContent(this.render())
  }

  /**
   * Get the current matcher data
   */
  getMatcher(): Matcher {
    return this.matcher
  }
}
