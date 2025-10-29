/**
 * Tests for MatcherTableComponent
 * Covers rendering, component management, and lifecycle
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MatcherTableComponent } from '../matcher-table.component'
import { Matcher } from '../../../lib/types'

function createTestMatcher(overrides: Partial<Matcher> = {}): Matcher {
  return {
    id: `matcher-${Math.random()}`,
    urlFilter: 'localhost:3000',
    resourceTypes: [],
    ...overrides,
  }
}

describe('MatcherTableComponent', () => {
  let container: HTMLElement
  let component: MatcherTableComponent

  beforeEach(() => {
    const table = document.createElement('table')
    const tbody = document.createElement('tbody')
    container = tbody
    table.appendChild(tbody)
    document.body.appendChild(table)
    component = new MatcherTableComponent(container, {
      onChange: vi.fn(),
      onDelete: vi.fn(),
    })
  })

  afterEach(() => {
    component.unmountAll()
    const table = container.parentElement
    if (table?.parentElement) {
      table.parentElement.removeChild(table)
    }
  })

  describe('mounting and rendering', () => {
    it('should render empty list when no matchers', () => {
      component.render([])

      expect(container.children.length).toBe(0)
      expect(component.getCount()).toBe(0)
    })

    it('should mount single matcher', () => {
      const matcher = createTestMatcher({ id: 'm1' })
      component.render([matcher])

      expect(container.children.length).toBe(1)
      expect(component.getCount()).toBe(1)
    })

    it('should mount multiple matchers in order', () => {
      const matchers = [
        createTestMatcher({ id: 'm1', urlFilter: 'url1.com' }),
        createTestMatcher({ id: 'm2', urlFilter: 'url2.com' }),
        createTestMatcher({ id: 'm3', urlFilter: 'url3.com' }),
      ]

      component.render(matchers)

      expect(container.children.length).toBe(3)
      expect(component.getCount()).toBe(3)

      // Check order by reading values
      const inputs = container.querySelectorAll('[data-role="urlFilter"]')
      expect((inputs[0] as HTMLInputElement).value).toBe('url1.com')
      expect((inputs[1] as HTMLInputElement).value).toBe('url2.com')
      expect((inputs[2] as HTMLInputElement).value).toBe('url3.com')
    })

    it('should have correct data-mid attributes', () => {
      const matchers = [createTestMatcher({ id: 'm1' }), createTestMatcher({ id: 'm2' })]

      component.render(matchers)

      const rows = container.querySelectorAll('[data-mid]')
      expect((rows[0] as HTMLElement).getAttribute('data-mid')).toBe('m1')
      expect((rows[1] as HTMLElement).getAttribute('data-mid')).toBe('m2')
    })
  })

  describe('updating matchers', () => {
    it('should update matcher when same ID re-rendered', () => {
      const matcher1 = createTestMatcher({ id: 'm1', urlFilter: 'original.com' })
      component.render([matcher1])

      let input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toBe('original.com')

      const matcher2 = createTestMatcher({ id: 'm1', urlFilter: 'updated.com' })
      component.render([matcher2])

      input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toBe('updated.com')
      expect(component.getCount()).toBe(1) // Still one matcher
    })

    it('should preserve component instance when updating', () => {
      const matcher1 = createTestMatcher({ id: 'm1' })
      component.render([matcher1])

      const comp1 = component.getComponent('m1')

      const matcher2 = createTestMatcher({ id: 'm1', urlFilter: 'updated.com' })
      component.render([matcher2])

      const comp2 = component.getComponent('m1')

      // Component instance should be the same
      expect(comp1).toBe(comp2)
    })
  })

  describe('removing matchers', () => {
    it('should remove matcher when no longer in list', () => {
      const matchers = [
        createTestMatcher({ id: 'm1' }),
        createTestMatcher({ id: 'm2' }),
        createTestMatcher({ id: 'm3' }),
      ]

      component.render(matchers)
      expect(component.getCount()).toBe(3)

      // Remove middle matcher
      component.render([matchers[0], matchers[2]])

      expect(component.getCount()).toBe(2)
      expect(component.isMounted('m1')).toBe(true)
      expect(component.isMounted('m2')).toBe(false)
      expect(component.isMounted('m3')).toBe(true)
    })

    it('should clear all matchers when rendering empty list', () => {
      const matchers = [createTestMatcher({ id: 'm1' }), createTestMatcher({ id: 'm2' })]

      component.render(matchers)
      expect(component.getCount()).toBe(2)

      component.render([])

      expect(component.getCount()).toBe(0)
      expect(container.children.length).toBe(0)
    })

    it('should remove element from DOM when unmounted', () => {
      const matchers = [createTestMatcher({ id: 'm1' }), createTestMatcher({ id: 'm2' })]

      component.render(matchers)
      expect(container.children.length).toBe(2)

      component.render([matchers[0]])

      expect(container.children.length).toBe(1)
      expect(container.querySelector('[data-mid="m1"]')).toBeDefined()
      expect(container.querySelector('[data-mid="m2"]')).toBeNull()
    })
  })

  describe('adding matchers', () => {
    it('should add new matcher to existing list', () => {
      const matcher1 = createTestMatcher({ id: 'm1' })
      component.render([matcher1])
      expect(component.getCount()).toBe(1)

      const matcher2 = createTestMatcher({ id: 'm2' })
      component.render([matcher1, matcher2])

      expect(component.getCount()).toBe(2)
      expect(component.isMounted('m1')).toBe(true)
      expect(component.isMounted('m2')).toBe(true)
    })

    it('should append matchers in correct order', () => {
      const matchers = [
        createTestMatcher({ id: 'm1', urlFilter: 'url1.com' }),
        createTestMatcher({ id: 'm2', urlFilter: 'url2.com' }),
      ]

      component.render(matchers)

      const inputs = container.querySelectorAll('[data-role="urlFilter"]')
      expect((inputs[0] as HTMLInputElement).value).toBe('url1.com')
      expect((inputs[1] as HTMLInputElement).value).toBe('url2.com')
    })
  })

  describe('reordering matchers', () => {
    it('should reorder matchers when list order changes', () => {
      const m1 = createTestMatcher({ id: 'm1', urlFilter: 'url1.com' })
      const m2 = createTestMatcher({ id: 'm2', urlFilter: 'url2.com' })
      const m3 = createTestMatcher({ id: 'm3', urlFilter: 'url3.com' })

      component.render([m1, m2, m3])

      // Reverse order
      component.render([m3, m2, m1])

      const inputs = container.querySelectorAll('[data-role="urlFilter"]')
      expect((inputs[0] as HTMLInputElement).value).toBe('url3.com')
      expect((inputs[1] as HTMLInputElement).value).toBe('url2.com')
      expect((inputs[2] as HTMLInputElement).value).toBe('url1.com')
    })
  })

  describe('component retrieval', () => {
    it('should return component by ID', () => {
      const matcher = createTestMatcher({ id: 'm1' })
      component.render([matcher])

      const comp = component.getComponent('m1')
      expect(comp).toBeDefined()
      expect(comp?.getMatcher().id).toBe('m1')
    })

    it('should return undefined for non-existent component', () => {
      component.render([])

      const comp = component.getComponent('non-existent')
      expect(comp).toBeUndefined()
    })

    it('should return undefined for removed component', () => {
      const m1 = createTestMatcher({ id: 'm1' })
      const m2 = createTestMatcher({ id: 'm2' })

      component.render([m1, m2])
      expect(component.getComponent('m1')).toBeDefined()

      component.render([m2])
      expect(component.getComponent('m1')).toBeUndefined()
    })
  })

  describe('mounted state checking', () => {
    it('should track mounted state correctly', () => {
      const m1 = createTestMatcher({ id: 'm1' })
      const m2 = createTestMatcher({ id: 'm2' })

      component.render([m1, m2])

      expect(component.isMounted('m1')).toBe(true)
      expect(component.isMounted('m2')).toBe(true)
      expect(component.isMounted('m3')).toBe(false)
    })

    it('should reflect mounted state after update', () => {
      const m1 = createTestMatcher({ id: 'm1' })
      const m2 = createTestMatcher({ id: 'm2' })
      const m3 = createTestMatcher({ id: 'm3' })

      component.render([m1, m2])
      expect(component.isMounted('m3')).toBe(false)

      component.render([m1, m2, m3])
      expect(component.isMounted('m3')).toBe(true)

      component.render([m1])
      expect(component.isMounted('m2')).toBe(false)
      expect(component.isMounted('m3')).toBe(false)
    })
  })

  describe('count tracking', () => {
    it('should track count accurately', () => {
      expect(component.getCount()).toBe(0)

      const m1 = createTestMatcher({ id: 'm1' })
      component.render([m1])
      expect(component.getCount()).toBe(1)

      const m2 = createTestMatcher({ id: 'm2' })
      const m3 = createTestMatcher({ id: 'm3' })
      component.render([m1, m2, m3])
      expect(component.getCount()).toBe(3)

      component.render([m1])
      expect(component.getCount()).toBe(1)

      component.render([])
      expect(component.getCount()).toBe(0)
    })
  })

  describe('unmounting all', () => {
    it('should unmount all matchers', () => {
      const matchers = [
        createTestMatcher({ id: 'm1' }),
        createTestMatcher({ id: 'm2' }),
        createTestMatcher({ id: 'm3' }),
      ]

      component.render(matchers)
      expect(component.getCount()).toBe(3)

      component.unmountAll()

      expect(component.getCount()).toBe(0)
      expect(container.children.length).toBe(0)
      expect(component.isMounted('m1')).toBe(false)
      expect(component.isMounted('m2')).toBe(false)
      expect(component.isMounted('m3')).toBe(false)
    })

    it('should allow re-rendering after unmountAll', () => {
      const m1 = createTestMatcher({ id: 'm1', urlFilter: 'url1.com' })
      component.render([m1])
      component.unmountAll()

      // Should be able to render again
      const m2 = createTestMatcher({ id: 'm2', urlFilter: 'url2.com' })
      component.render([m2])

      expect(component.getCount()).toBe(1)
      const input = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      expect(input.value).toBe('url2.com')
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple add/remove/update cycles', () => {
      const m1 = createTestMatcher({ id: 'm1' })
      const m2 = createTestMatcher({ id: 'm2' })
      const m3 = createTestMatcher({ id: 'm3' })

      // Add m1
      component.render([m1])
      expect(component.getCount()).toBe(1)

      // Add m2, m3
      component.render([m1, m2, m3])
      expect(component.getCount()).toBe(3)

      // Remove m2
      component.render([m1, m3])
      expect(component.getCount()).toBe(2)

      // Update m1, add m4
      const m4 = createTestMatcher({ id: 'm4' })
      component.render([m1, m3, m4])
      expect(component.getCount()).toBe(3)

      // Clear all
      component.render([])
      expect(component.getCount()).toBe(0)
    })

    it('should handle matchers with different configurations', () => {
      const matchers = [
        createTestMatcher({ id: 'm1', urlFilter: 'url1.com', resourceTypes: [] }),
        createTestMatcher({ id: 'm2', urlFilter: 'url2.com', resourceTypes: ['xmlhttprequest'] }),
        createTestMatcher({
          id: 'm3',
          urlFilter: 'url3.com',
          resourceTypes: ['script', 'stylesheet'],
        }),
      ]

      component.render(matchers)

      expect(component.getCount()).toBe(3)

      // All should be mounted
      matchers.forEach((m) => {
        expect(component.isMounted(m.id)).toBe(true)
      })
    })

    it('should maintain component identity during updates', () => {
      const m1 = createTestMatcher({ id: 'm1' })
      const m2 = createTestMatcher({ id: 'm2' })

      component.render([m1, m2])
      const comp1 = component.getComponent('m1')
      const comp2 = component.getComponent('m2')

      // Update list with same IDs
      const m1Updated = createTestMatcher({ id: 'm1', urlFilter: 'updated.com' })
      component.render([m1Updated, m2])

      const comp1After = component.getComponent('m1')
      const comp2After = component.getComponent('m2')

      // Component instances should be the same
      expect(comp1).toBe(comp1After)
      expect(comp2).toBe(comp2After)
    })
  })

  describe('container interaction', () => {
    it('should render matchers into correct container', () => {
      const table2 = document.createElement('table')
      const tbody2 = document.createElement('tbody')
      table2.appendChild(tbody2)
      document.body.appendChild(table2)

      const component2 = new MatcherTableComponent(tbody2, {
        onChange: vi.fn(),
        onDelete: vi.fn(),
      })

      const m1 = createTestMatcher({ id: 'm1' })
      const m2 = createTestMatcher({ id: 'm2' })

      component.render([m1])
      component2.render([m2])

      expect(container.children.length).toBe(1)
      expect(tbody2.children.length).toBe(1)

      const input1 = container.querySelector('[data-role="urlFilter"]') as HTMLInputElement
      const input2 = tbody2.querySelector('[data-role="urlFilter"]') as HTMLInputElement

      expect(input1.value).toBe(m1.urlFilter)
      expect(input2.value).toBe(m2.urlFilter)

      component2.unmountAll()
      document.body.removeChild(table2)
    })

    it('should clear container before rendering', () => {
      // Pre-fill container with some content
      container.innerHTML = '<div>old content</div>'
      expect(container.children.length).toBe(1)

      const m1 = createTestMatcher({ id: 'm1' })
      component.render([m1])

      // Old content should be cleared
      expect(container.children.length).toBe(1)
      expect(container.querySelector('div:not([data-mid])')).toBeNull()
    })
  })
})
