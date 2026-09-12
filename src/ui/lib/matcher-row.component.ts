/**
 * MatcherRowComponent - Encapsulates matcher row rendering and event handling
 * Extends the base Component class for lifecycle management
 */

import { writeURLRule, validateRegexFilter, type URLRuleMode } from '../../lib/url-rule'
import type { Matcher } from '../../lib/types'
import { matcherRow } from '../components/matchers/matcher-row'
import { Component } from './component'

export interface MatcherRowCallbacks {
  onChange: (id: string, field: 'urlFilter' | 'types', value: string) => void
  onDelete: (id: string) => void
}

export class MatcherRowComponent extends Component {
  private savedSnapshot = ''
  constructor(
    private matcher: Matcher,
    private callbacks: MatcherRowCallbacks
  ) {
    super(`matcher-row-${matcher.id}`)
  }

  render(): string {
    this.savedSnapshot = JSON.stringify(this.matcher)
    return matcherRow(this.matcher)
  }

  protected setupHandlers(): void {
    const input = this.el!.querySelector<HTMLInputElement>('[data-role="urlFilter"]')!
    const mode = this.el!.querySelector<HTMLSelectElement>('[data-role="mode"]')!
    const feedback = this.el!.querySelector<HTMLElement>('[data-role="ruleFeedback"]')!
    let revision = 0
    const show = (message: string, invalid = false) => {
      feedback.textContent = message
      feedback.classList.toggle('matcher-row__feedback--error', invalid)
      input.setAttribute('aria-invalid', String(invalid))
      input.setCustomValidity(invalid ? message : '')
      if (invalid) feedback.scrollIntoView?.({ block: 'nearest' })
    }
    const commit = async () => {
      const currentRevision = ++revision
      try {
        const filter = writeURLRule(mode.value as URLRuleMode, input.value)
        await validateRegexFilter(filter)
        if (currentRevision !== revision || !this.isMounted() || !input.isConnected) return
        this.matcher.urlFilter = filter
        this.callbacks.onChange(this.matcher.id, 'urlFilter', filter)
        this.savedSnapshot = JSON.stringify(this.matcher)
        show(
          mode.value === 'all'
            ? 'All sites: headers may be sent to any destination.'
            : 'Rule validated.'
        )
      } catch (error) {
        if (currentRevision !== revision || !this.isMounted() || !input.isConnected) return
        show(
          `${error instanceof Error ? error.message : 'Could not validate this rule.'} Last saved rule kept.`,
          true
        )
      }
    }
    this.on('input', '[data-role="urlFilter"]', () => {
      revision++
      show('Unsaved edit. Leave this field to validate and save.')
    })
    this.on('change', '[data-role="urlFilter"]', () => {
      void commit()
    })
    this.on('change', '[data-role="mode"]', () => {
      revision++
      input.disabled = mode.value === 'all'
      input.value = ''
      input.placeholder =
        mode.value === 'site'
          ? 'api.example.com'
          : mode.value === 'regex'
            ? '^https://example.com/'
            : mode.value === 'all'
              ? 'Every site'
              : 'https://example.com/api/*'
      if (mode.value === 'all') void commit()
      else {
        show('Enter a value to replace the saved rule.')
        input.focus()
      }
    })

    // Handle resource type changes
    this.on('change', '[data-role="types"]', (e) => {
      const select = e.target as HTMLSelectElement
      const value = select.value || ''
      this.callbacks.onChange(this.matcher.id, 'types', value)
      this.savedSnapshot = JSON.stringify(this.matcher)
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
    const unchanged = JSON.stringify(matcher) === this.savedSnapshot
    this.matcher = matcher
    if (!unchanged) this.updateContent(this.render())
  }

  /**
   * Get the current matcher data
   */
  getMatcher(): Matcher {
    return this.matcher
  }
}
