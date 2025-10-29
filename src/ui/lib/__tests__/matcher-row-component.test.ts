/**
 * Tests for MatcherRowComponent
 * Covers rendering, event handling, and matcher updates
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MatcherRowComponent, MatcherRowCallbacks } from '../matcher-row-component'
import { Matcher } from '../../../lib/types'

function createTestMatcher(overrides: Partial<Matcher> = {}): Matcher {
  return {
    id: 'matcher-1',
    urlFilter: 'localhost:3000',
    resourceTypes: [],
    ...overrides,
  }
}

function createMockCallbacks(): MatcherRowCallbacks {
  return {
    onChange: vi.fn(),
    onDelete: vi.fn(),
  }
}

describe('MatcherRowComponent', () => {
  let container: HTMLElement
  let matcher: Matcher
  let callbacks: MatcherRowCallbacks
  let component: MatcherRowComponent

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    matcher = createTestMatcher()
    callbacks = createMockCallbacks()
    component = new MatcherRowComponent(matcher, callbacks)
  })

  afterEach(() => {
    component.unmount()
    document.body.removeChild(container)
  })

  describe('rendering', () => {
    it('should render matcher row with basic structure', () => {
      component.mount(container)

      expect(container.querySelector('[data-mid]')).toBeDefined()
      expect(container.querySelector('[data-role="urlFilter"]')).toBeDefined()
      expect(container.querySelector('[data-role="types"]')).toBeDefined()
      expect(container.querySelector('[data-action="removeMatcher"]')).toBeDefined()
    })

    it('should display URL filter value', () => {
      component.mount(container)

      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toBe('localhost:3000')
    })

    it('should display empty string when URL filter is empty (all domains)', () => {
      matcher.urlFilter = '*'
      component = new MatcherRowComponent(matcher, callbacks)
      component.mount(container)

      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should escape HTML in URL filter', () => {
      matcher.urlFilter = '<script>alert("xss")</script>'
      component = new MatcherRowComponent(matcher, callbacks)
      component.mount(container)

      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toContain('<script>')
      expect(container.querySelector('script')).toBeNull()
    })

    it('should include data-mid attribute with matcher ID', () => {
      component.mount(container)

      const row = container.querySelector('[data-mid]')
      expect(row?.getAttribute('data-mid')).toBe('matcher-1')
    })

    it('should have select element with all resource type options', () => {
      component.mount(container)

      const select = container.querySelector('[data-role="types"]') as HTMLSelectElement
      expect(select.options.length).toBe(8) // All request types + empty option
      expect(select.options[0].value).toBe('')
      expect(select.options[0].textContent).toBe('All request types')
    })
  })

  describe('resource type selection', () => {
    it('should show "All request types" when no specific type is selected', () => {
      matcher.resourceTypes = []
      component = new MatcherRowComponent(matcher, callbacks)
      component.mount(container)

      const select = container.querySelector('[data-role="types"]') as HTMLSelectElement
      // When resourceTypes is empty, the empty option should be selected
      expect(select.value).toBe('')
    })

    it('should show first selected resource type (single select)', () => {
      matcher.resourceTypes = ['xmlhttprequest']
      component = new MatcherRowComponent(matcher, callbacks)
      component.mount(container)

      const select = container.querySelector('[data-role="types"]') as HTMLSelectElement
      expect(select.value).toBe('xmlhttprequest')
    })

    it('should show last resource type when multiple are stored', () => {
      // Note: The template has a single-select, so when multiple types are marked selected,
      // the browser will use the last selected one
      matcher.resourceTypes = ['xmlhttprequest', 'script']
      component = new MatcherRowComponent(matcher, callbacks)
      component.mount(container)

      const select = container.querySelector('[data-role="types"]') as HTMLSelectElement
      // In a single-select with multiple `selected` attributes, browser uses the last one
      expect(select.value).toBe('script')
    })
  })

  describe('event handling', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should call onChange when URL filter changes', () => {
      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      input.value = 'example.com'
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(callbacks.onChange).toHaveBeenCalledWith('matcher-1', 'urlFilter', 'example.com')
    })

    it('should convert empty URL filter to "*"', () => {
      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(callbacks.onChange).toHaveBeenCalledWith('matcher-1', 'urlFilter', '*')
    })

    it('should call onChange when resource types change', () => {
      const select = container.querySelector('[data-role="types"]') as HTMLSelectElement
      const option = select.querySelector('option[value="xmlhttprequest"]') as HTMLOptionElement
      option.selected = true
      select.dispatchEvent(new Event('change', { bubbles: true }))

      expect(callbacks.onChange).toHaveBeenCalledWith('matcher-1', 'resourceTypes', [
        'xmlhttprequest',
      ])
    })

    it('should handle selecting different resource type', () => {
      const select = container.querySelector('[data-role="types"]') as HTMLSelectElement
      ;(select.querySelector('option[value="stylesheet"]') as HTMLOptionElement).selected = true
      select.dispatchEvent(new Event('change', { bubbles: true }))

      expect(callbacks.onChange).toHaveBeenCalledWith('matcher-1', 'resourceTypes', ['stylesheet'])
    })

    it('should filter out empty string from resource types', () => {
      const select = container.querySelector('[data-role="types"]') as HTMLSelectElement
      ;(select.querySelector('option[value=""]') as HTMLOptionElement).selected = true
      ;(select.querySelector('option[value="image"]') as HTMLOptionElement).selected = true
      select.dispatchEvent(new Event('change', { bubbles: true }))

      expect(callbacks.onChange).toHaveBeenCalledWith('matcher-1', 'resourceTypes', ['image'])
    })

    it('should call onDelete when delete button clicked', () => {
      const btn = container.querySelector('[data-action="removeMatcher"]') as HTMLButtonElement
      btn.click()

      expect(callbacks.onDelete).toHaveBeenCalledOnce()
      expect(callbacks.onDelete).toHaveBeenCalledWith('matcher-1')
    })

    it('should handle multiple changes to same matcher', () => {
      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      const select = container.querySelector('[data-role="types"]') as HTMLSelectElement

      input.value = 'example.com'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(callbacks.onChange).toHaveBeenCalledTimes(1)
      ;(select.querySelector('option[value="xmlhttprequest"]') as HTMLOptionElement).selected = true
      select.dispatchEvent(new Event('change', { bubbles: true }))
      expect(callbacks.onChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('matcher updates', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should update matcher data', () => {
      const newMatcher = createTestMatcher({
        id: 'matcher-1',
        urlFilter: 'api.example.com',
      })

      component.updateMatcher(newMatcher)

      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toBe('api.example.com')
    })

    it('should update resource type', () => {
      const newMatcher = createTestMatcher({
        id: 'matcher-1',
        resourceTypes: ['script'],
      })

      component.updateMatcher(newMatcher)

      const select = container.querySelector('[data-role="types"]') as HTMLSelectElement
      expect(select.value).toBe('script')
    })

    it('should preserve event handlers after update', () => {
      let firstValue = ''
      callbacks.onChange = vi.fn((_id, _field, value) => {
        firstValue = value as string
      })

      // First interaction
      let input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      input.value = 'first.com'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(firstValue).toBe('first.com')

      // Update matcher
      component.updateMatcher(createTestMatcher({ id: 'matcher-1', urlFilter: 'updated.com' }))

      // Second interaction should still work
      input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      input.value = 'second.com'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(callbacks.onChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('getter methods', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should return current matcher via getMatcher()', () => {
      const retrieved = component.getMatcher()
      expect(retrieved.id).toBe('matcher-1')
      expect(retrieved.urlFilter).toBe('localhost:3000')
    })

    it('should return updated matcher after updateMatcher()', () => {
      const newMatcher = createTestMatcher({
        id: 'matcher-1',
        urlFilter: 'new-url.com',
      })

      component.updateMatcher(newMatcher)

      const retrieved = component.getMatcher()
      expect(retrieved.urlFilter).toBe('new-url.com')
    })
  })

  describe('edge cases', () => {
    it('should handle very long URLs', () => {
      const longUrl = 'localhost:3000/' + 'a'.repeat(500)
      matcher.urlFilter = longUrl
      component = new MatcherRowComponent(matcher, callbacks)
      component.mount(container)

      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toBe(longUrl)
    })

    it('should handle special characters in URL', () => {
      const specialUrl = 'example.com?foo=bar&baz=qux#hash'
      matcher.urlFilter = specialUrl
      component = new MatcherRowComponent(matcher, callbacks)
      component.mount(container)

      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toBe(specialUrl)
    })

    it('should handle regex pattern in URL', () => {
      const regexUrl = 'regex:localhost:30(0[0-9])'
      matcher.urlFilter = regexUrl
      component = new MatcherRowComponent(matcher, callbacks)
      component.mount(container)

      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toBe(regexUrl)
    })

    it('should handle wildcard pattern in URL', () => {
      const wildcardUrl = '*.example.com'
      matcher.urlFilter = wildcardUrl
      component = new MatcherRowComponent(matcher, callbacks)
      component.mount(container)

      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toBe(wildcardUrl)
    })

    it('should handle undefined resourceTypes gracefully', () => {
      matcher.resourceTypes = undefined
      component = new MatcherRowComponent(matcher, callbacks)

      expect(() => component.mount(container)).not.toThrow()
      expect(component.isMounted()).toBe(true)
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should have proper placeholder text', () => {
      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.placeholder).toBe('Leave empty for all domains')
    })

    it('should have button with title attribute', () => {
      const btn = container.querySelector('[data-action="removeMatcher"]')
      expect(btn?.getAttribute('title')).toBe('Remove matcher')
    })

    it('should have properly labeled select with options', () => {
      const select = container.querySelector('[data-role="types"]') as HTMLSelectElement
      expect(select).toBeDefined()
      const options = select.querySelectorAll('option')
      expect(options[0].textContent).toContain('All request types')
    })
  })

  describe('multiple instances', () => {
    it('should manage separate state for multiple matchers', () => {
      const container1 = document.createElement('div')
      const container2 = document.createElement('div')
      document.body.appendChild(container1)
      document.body.appendChild(container2)

      const matcher1 = createTestMatcher({ id: 'm1', urlFilter: 'url1.com' })
      const matcher2 = createTestMatcher({ id: 'm2', urlFilter: 'url2.com' })

      const comp1 = new MatcherRowComponent(matcher1, createMockCallbacks())
      const comp2 = new MatcherRowComponent(matcher2, createMockCallbacks())

      comp1.mount(container1)
      comp2.mount(container2)

      const input1 = container1.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      const input2 = container2.querySelector('[data-role="urlFilter"]') as HTMLInputElement

      expect(input1.value).toBe('url1.com')
      expect(input2.value).toBe('url2.com')

      comp1.unmount()
      comp2.unmount()
      document.body.removeChild(container1)
      document.body.removeChild(container2)
    })
  })
})
