/**
 * Tests for HeaderListComponent
 * Covers rendering, component management, and lifecycle
 * Includes tests for both request and response header variants
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { HeaderListComponent } from '../header-list-component'
import { HeaderOp } from '../../../lib/types'
import '../../components/checkbox-element'
import type { CheckboxElement } from '../../components/checkbox-element'

function createTestHeader(overrides: Partial<HeaderOp> = {}): HeaderOp {
  return {
    id: `header-${Math.random()}`,
    header: 'X-Custom',
    value: 'test-value',
    enabled: true,
    ...overrides,
  }
}

describe('HeaderListComponent', () => {
  let container: HTMLElement
  let component: HeaderListComponent

  beforeEach(() => {
    const table = document.createElement('table')
    const tbody = document.createElement('tbody')
    container = tbody
    table.appendChild(tbody)
    document.body.appendChild(table)
    component = new HeaderListComponent(
      container,
      {
        onChange: vi.fn(),
        onDelete: vi.fn(),
      },
      true
    )
  })

  afterEach(() => {
    component.unmountAll()
    const table = container.parentElement
    if (table?.parentElement) {
      table.parentElement.removeChild(table)
    }
  })

  describe('mounting and rendering', () => {
    it('should render empty list when no headers', () => {
      component.render([])

      expect(container.children.length).toBe(0)
      expect(component.getCount()).toBe(0)
    })

    it('should mount single header', () => {
      const header = createTestHeader({ id: 'h1' })
      component.render([header])

      expect(container.children.length).toBe(1)
      expect(component.getCount()).toBe(1)
    })

    it('should mount multiple headers in order', () => {
      const headers = [
        createTestHeader({ id: 'h1', header: 'Authorization' }),
        createTestHeader({ id: 'h2', header: 'X-Custom' }),
        createTestHeader({ id: 'h3', header: 'Accept' }),
      ]

      component.render(headers)

      expect(container.children.length).toBe(3)
      expect(component.getCount()).toBe(3)

      // Check order by reading values
      const inputs = container.querySelectorAll('[data-role="header"]')
      expect((inputs[0] as HTMLInputElement).value).toBe('Authorization')
      expect((inputs[1] as HTMLInputElement).value).toBe('X-Custom')
      expect((inputs[2] as HTMLInputElement).value).toBe('Accept')
    })

    it('should have correct data-hid attributes', () => {
      const headers = [createTestHeader({ id: 'h1' }), createTestHeader({ id: 'h2' })]

      component.render(headers)

      const rows = container.querySelectorAll('[data-hid]')
      expect((rows[0] as HTMLElement).getAttribute('data-hid')).toBe('h1')
      expect((rows[1] as HTMLElement).getAttribute('data-hid')).toBe('h2')
    })

    it('should mark headers as request type', () => {
      const header = createTestHeader({ id: 'h1' })
      component.render([header])

      const row = container.querySelector('[data-kind]')
      expect(row?.getAttribute('data-kind')).toBe('req')
    })
  })

  describe('updating headers', () => {
    it('should update header when same ID re-rendered', () => {
      const header1 = createTestHeader({ id: 'h1', header: 'Original' })
      component.render([header1])

      let input = container.querySelector('[data-role="header"]') as HTMLInputElement
      expect(input.value).toBe('Original')

      const header2 = createTestHeader({ id: 'h1', header: 'Updated' })
      component.render([header2])

      input = container.querySelector('[data-role="header"]') as HTMLInputElement
      expect(input.value).toBe('Updated')
      expect(component.getCount()).toBe(1)
    })

    it('should preserve component instance when updating', () => {
      const header1 = createTestHeader({ id: 'h1' })
      component.render([header1])

      const comp1 = component.getComponent('h1')

      const header2 = createTestHeader({ id: 'h1', header: 'Updated' })
      component.render([header2])

      const comp2 = component.getComponent('h1')

      expect(comp1).toBe(comp2)
    })
  })

  describe('removing headers', () => {
    it('should remove header when no longer in list', () => {
      const headers = [
        createTestHeader({ id: 'h1' }),
        createTestHeader({ id: 'h2' }),
        createTestHeader({ id: 'h3' }),
      ]

      component.render(headers)
      expect(component.getCount()).toBe(3)

      component.render([headers[0], headers[2]])

      expect(component.getCount()).toBe(2)
      expect(component.isMounted('h1')).toBe(true)
      expect(component.isMounted('h2')).toBe(false)
      expect(component.isMounted('h3')).toBe(true)
    })

    it('should clear all headers when rendering empty list', () => {
      const headers = [createTestHeader({ id: 'h1' }), createTestHeader({ id: 'h2' })]

      component.render(headers)
      expect(component.getCount()).toBe(2)

      component.render([])

      expect(component.getCount()).toBe(0)
      expect(container.children.length).toBe(0)
    })
  })

  describe('adding headers', () => {
    it('should add new header to existing list', () => {
      const h1 = createTestHeader({ id: 'h1' })
      component.render([h1])
      expect(component.getCount()).toBe(1)

      const h2 = createTestHeader({ id: 'h2' })
      component.render([h1, h2])

      expect(component.getCount()).toBe(2)
      expect(component.isMounted('h1')).toBe(true)
      expect(component.isMounted('h2')).toBe(true)
    })
  })

  describe('reordering headers', () => {
    it('should reorder headers when list order changes', () => {
      const h1 = createTestHeader({ id: 'h1', header: 'First' })
      const h2 = createTestHeader({ id: 'h2', header: 'Second' })
      const h3 = createTestHeader({ id: 'h3', header: 'Third' })

      component.render([h1, h2, h3])

      // Reverse order
      component.render([h3, h2, h1])

      const inputs = container.querySelectorAll('[data-role="header"]')
      expect((inputs[0] as HTMLInputElement).value).toBe('Third')
      expect((inputs[1] as HTMLInputElement).value).toBe('Second')
      expect((inputs[2] as HTMLInputElement).value).toBe('First')
    })
  })

  describe('component retrieval', () => {
    it('should return component by ID', () => {
      const header = createTestHeader({ id: 'h1' })
      component.render([header])

      const comp = component.getComponent('h1')
      expect(comp).toBeDefined()
      expect(comp?.getHeader().id).toBe('h1')
    })

    it('should return undefined for non-existent component', () => {
      component.render([])

      const comp = component.getComponent('non-existent')
      expect(comp).toBeUndefined()
    })
  })

  describe('mounted state checking', () => {
    it('should track mounted state correctly', () => {
      const h1 = createTestHeader({ id: 'h1' })
      const h2 = createTestHeader({ id: 'h2' })

      component.render([h1, h2])

      expect(component.isMounted('h1')).toBe(true)
      expect(component.isMounted('h2')).toBe(true)
      expect(component.isMounted('h3')).toBe(false)
    })
  })

  describe('count tracking', () => {
    it('should track count accurately', () => {
      expect(component.getCount()).toBe(0)

      const h1 = createTestHeader({ id: 'h1' })
      component.render([h1])
      expect(component.getCount()).toBe(1)

      const h2 = createTestHeader({ id: 'h2' })
      const h3 = createTestHeader({ id: 'h3' })
      component.render([h1, h2, h3])
      expect(component.getCount()).toBe(3)

      component.render([h1])
      expect(component.getCount()).toBe(1)

      component.render([])
      expect(component.getCount()).toBe(0)
    })
  })

  describe('unmounting all', () => {
    it('should unmount all headers', () => {
      const headers = [
        createTestHeader({ id: 'h1' }),
        createTestHeader({ id: 'h2' }),
        createTestHeader({ id: 'h3' }),
      ]

      component.render(headers)
      expect(component.getCount()).toBe(3)

      component.unmountAll()

      expect(component.getCount()).toBe(0)
      expect(container.children.length).toBe(0)
    })
  })

  describe('request vs response headers', () => {
    it('should create request headers by default', () => {
      expect(component.getHeaderType()).toBe('request')

      const header = createTestHeader({ id: 'h1' })
      component.render([header])

      const row = container.querySelector('[data-kind]')
      expect(row?.getAttribute('data-kind')).toBe('req')
    })

    it('should create response headers when specified', () => {
      const resComponent = new HeaderListComponent(
        container,
        {
          onChange: vi.fn(),
          onDelete: vi.fn(),
        },
        false
      )

      expect(resComponent.getHeaderType()).toBe('response')

      const header = createTestHeader({ id: 'h1' })
      resComponent.render([header])

      const row = container.querySelector('[data-kind]')
      expect(row?.getAttribute('data-kind')).toBe('res')

      resComponent.unmountAll()
    })

    it('should maintain request/response type across operations', () => {
      expect(component.getHeaderType()).toBe('request')

      const headers = [createTestHeader({ id: 'h1' }), createTestHeader({ id: 'h2' })]

      component.render(headers)
      expect(component.getHeaderType()).toBe('request')

      component.render([headers[0]])
      expect(component.getHeaderType()).toBe('request')

      component.unmountAll()
      expect(component.getHeaderType()).toBe('request')
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple add/remove/update cycles', () => {
      const h1 = createTestHeader({ id: 'h1' })
      const h2 = createTestHeader({ id: 'h2' })
      const h3 = createTestHeader({ id: 'h3' })

      component.render([h1])
      expect(component.getCount()).toBe(1)

      component.render([h1, h2, h3])
      expect(component.getCount()).toBe(3)

      component.render([h1, h3])
      expect(component.getCount()).toBe(2)

      const h4 = createTestHeader({ id: 'h4' })
      component.render([h1, h3, h4])
      expect(component.getCount()).toBe(3)

      component.render([])
      expect(component.getCount()).toBe(0)
    })

    it('should handle headers with different enabled states', () => {
      const headers = [
        createTestHeader({ id: 'h1', enabled: true }),
        createTestHeader({ id: 'h2', enabled: false }),
        createTestHeader({ id: 'h3', enabled: true }),
      ]

      component.render(headers)

      expect(component.getCount()).toBe(3)

      const checkboxes = container.querySelectorAll('[data-role="enabled"]')
      expect((checkboxes[0] as CheckboxElement).checked).toBe(true)
      expect((checkboxes[1] as CheckboxElement).checked).toBe(false)
      expect((checkboxes[2] as CheckboxElement).checked).toBe(true)
    })

    it('should maintain component identity during updates', () => {
      const h1 = createTestHeader({ id: 'h1' })
      const h2 = createTestHeader({ id: 'h2' })

      component.render([h1, h2])
      const comp1 = component.getComponent('h1')
      const comp2 = component.getComponent('h2')

      const h1Updated = createTestHeader({ id: 'h1', header: 'Updated' })
      component.render([h1Updated, h2])

      const comp1After = component.getComponent('h1')
      const comp2After = component.getComponent('h2')

      expect(comp1).toBe(comp1After)
      expect(comp2).toBe(comp2After)
    })
  })

  describe('separate request and response lists', () => {
    it('should support separate request and response header lists', () => {
      const reqContainer = document.createElement('div')
      const resContainer = document.createElement('div')
      document.body.appendChild(reqContainer)
      document.body.appendChild(resContainer)

      const reqComponent = new HeaderListComponent(
        reqContainer,
        {
          onChange: vi.fn(),
          onDelete: vi.fn(),
        },
        true
      )

      const resComponent = new HeaderListComponent(
        resContainer,
        {
          onChange: vi.fn(),
          onDelete: vi.fn(),
        },
        false
      )

      const reqHeader = createTestHeader({ id: 'req1', header: 'Authorization' })
      const resHeader = createTestHeader({ id: 'res1', header: 'Cache-Control' })

      reqComponent.render([reqHeader])
      resComponent.render([resHeader])

      expect(reqContainer.querySelector('[data-kind="req"]')).toBeDefined()
      expect(resContainer.querySelector('[data-kind="res"]')).toBeDefined()

      expect(reqComponent.getHeaderType()).toBe('request')
      expect(resComponent.getHeaderType()).toBe('response')

      reqComponent.unmountAll()
      resComponent.unmountAll()
      document.body.removeChild(reqContainer)
      document.body.removeChild(resContainer)
    })
  })
})
