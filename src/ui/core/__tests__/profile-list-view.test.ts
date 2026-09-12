import { describe, expect, it } from 'vitest'
import type { Profile } from '../../../lib/types'
import { renderProfileList } from '../profile-list-view'

const profiles: Profile[] = [
  {
    id: 'production',
    name: 'Production',
    color: 'purple',
    notes: 'Public API',
    enabled: true,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'local',
    name: 'Local development',
    color: 'blue',
    notes: 'Debug headers',
    enabled: false,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
]

function createElements() {
  document.body.innerHTML = `
    <div id="list"></div>
    <div id="results" hidden></div>
    <div id="empty" class="hidden" hidden></div>
  `
  return {
    list: document.querySelector<HTMLElement>('#list'),
    searchResults: document.querySelector<HTMLElement>('#results'),
    noResults: document.querySelector<HTMLElement>('#empty'),
  }
}

describe('renderProfileList', () => {
  it('renders all profiles and identifies the current profile', () => {
    const elements = createElements()
    const filtered = renderProfileList(elements, profiles, 'production', '')

    expect(filtered).toEqual(profiles)
    expect(elements.list?.querySelector('[aria-selected="true"]')?.getAttribute('data-id')).toBe(
      'production'
    )
    expect(elements.searchResults?.hidden).toBe(true)
  })

  it('filters by name or notes and exposes an empty result', () => {
    const elements = createElements()
    expect(renderProfileList(elements, profiles, undefined, 'debug')).toEqual([profiles[1]])
    expect(elements.searchResults?.hidden).toBe(true)
    expect(elements.list?.querySelectorAll('a')).toHaveLength(1)
    expect(elements.list?.textContent).not.toContain('Production')
    expect(elements.noResults?.hidden).toBe(true)

    expect(renderProfileList(elements, profiles, undefined, 'missing')).toEqual([])
    expect(elements.noResults?.hidden).toBe(false)
    expect(elements.noResults?.classList.contains('hidden')).toBe(false)
    expect(elements.list?.querySelectorAll('a')).toHaveLength(0)
  })
})
