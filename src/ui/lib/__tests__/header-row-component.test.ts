/**
 * Tests for HeaderRowComponent
 * Covers rendering, event handling, and header updates
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { HeaderRowComponent, HeaderRowCallbacks } from '../header-row-component'
import { HeaderOp } from '../../../lib/types'
import '../../components/checkbox-element'
import type { CheckboxElement } from '../../components/checkbox-element'

function createTestHeader(overrides: Partial<HeaderOp> = {}): HeaderOp {
  return {
    id: 'header-1',
    header: 'Authorization',
    value: 'Bearer token123',
    enabled: true,
    ...overrides,
  }
}

function createMockCallbacks(): HeaderRowCallbacks {
  return {
    onChange: vi.fn(),
    onDelete: vi.fn(),
  }
}

describe('HeaderRowComponent', () => {
  let container: HTMLElement
  let header: HeaderOp
  let callbacks: HeaderRowCallbacks
  let component: HeaderRowComponent

  beforeEach(() => {
    const table = document.createElement('table')
    const tbody = document.createElement('tbody')
    container = tbody
    table.appendChild(tbody)
    document.body.appendChild(table)
    header = createTestHeader()
    callbacks = createMockCallbacks()
    component = new HeaderRowComponent(header, callbacks, true)
  })

  afterEach(() => {
    component.unmount()
    const table = container.parentElement
    if (table?.parentElement) {
      table.parentElement.removeChild(table)
    }
  })

  describe('rendering', () => {
    it('should render header row with basic structure', () => {
      component.mount(container)

      expect(container.querySelector('[data-hid]')).toBeDefined()
      expect(container.querySelector('[data-role="enabled"]')).toBeDefined()
      expect(container.querySelector('[data-role="header"]')).toBeDefined()
      expect(container.querySelector('[data-role="value"]')).toBeDefined()
      expect(container.querySelector('[data-action="removeHeader"]')).toBeDefined()
    })

    it('should display header name and value', () => {
      component.mount(container)

      const headerInput = container.querySelector('[data-role="header"]') as HTMLInputElement
      const valueInput = container.querySelector('[data-role="value"]') as HTMLInputElement

      expect(headerInput.value).toBe('Authorization')
      expect(valueInput.value).toBe('Bearer token123')
    })

    it('should show enabled checkbox when header is enabled', () => {
      component.mount(container)

      const checkbox = container.querySelector('[data-role="enabled"]') as CheckboxElement
      expect(checkbox.checked).toBe(true)
    })

    it('should show unchecked checkbox when header is disabled', () => {
      header.enabled = false
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const checkbox = container.querySelector('[data-role="enabled"]') as CheckboxElement
      expect(checkbox.checked).toBe(false)
    })

    it('should default to enabled when enabled field is undefined', () => {
      header.enabled = undefined
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const checkbox = container.querySelector('[data-role="enabled"]') as CheckboxElement
      expect(checkbox.checked).toBe(true)
    })

    it('should escape HTML in header name', () => {
      header.header = '<script>alert("xss")</script>'
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const input = container.querySelector('[data-role="header"]') as HTMLInputElement
      expect(input.value).toContain('<script>')
      expect(container.querySelector('script')).toBeNull()
    })

    it('should escape HTML in header value', () => {
      header.value = '"><img src=x onerror="alert(1)">'
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const input = container.querySelector('[data-role="value"]') as HTMLInputElement
      expect(input.value).toContain('"><img')
      expect(container.querySelector('img')).toBeNull()
    })

    it('should include data-hid attribute with header ID', () => {
      component.mount(container)

      const row = container.querySelector('[data-hid]')
      expect(row?.getAttribute('data-hid')).toBe('header-1')
    })

    it('should set data-kind to "req" for request headers', () => {
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const row = container.querySelector('[data-kind]')
      expect(row?.getAttribute('data-kind')).toBe('req')
    })

    it('should set data-kind to "res" for response headers', () => {
      component = new HeaderRowComponent(header, callbacks, false)
      component.mount(container)

      const row = container.querySelector('[data-kind]')
      expect(row?.getAttribute('data-kind')).toBe('res')
    })

    it('should have proper placeholder text', () => {
      component.mount(container)

      const headerInput = container.querySelector('[data-role="header"]') as HTMLInputElement
      const valueInput = container.querySelector('[data-role="value"]') as HTMLInputElement

      expect(headerInput.placeholder).toContain('Header name')
      expect(valueInput.placeholder).toBe('Value')
    })
  })

  describe('event handling', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should call onChange when header name changes', () => {
      const input = container.querySelector('[data-role="header"]') as HTMLInputElement
      input.value = 'X-Custom-Header'
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(callbacks.onChange).toHaveBeenCalledWith('header-1', 'header', 'X-Custom-Header')
    })

    it('should call onChange when header value changes', () => {
      const input = container.querySelector('[data-role="value"]') as HTMLInputElement
      input.value = 'new-value'
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(callbacks.onChange).toHaveBeenCalledWith('header-1', 'value', 'new-value')
    })

    it('should call onChange when enabled checkbox toggled', () => {
      const checkbox = container.querySelector('[data-role="enabled"]') as HTMLInputElement
      checkbox.checked = false
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))

      expect(callbacks.onChange).toHaveBeenCalledWith('header-1', 'enabled', false)
    })

    it('should call onChange when enabling previously disabled header', () => {
      header.enabled = false
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const checkbox = container.querySelector('[data-role="enabled"]') as HTMLInputElement
      checkbox.checked = true
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))

      expect(callbacks.onChange).toHaveBeenCalledWith('header-1', 'enabled', true)
    })

    it('should call onDelete when delete button clicked', () => {
      const btn = container.querySelector('[data-action="removeHeader"]') as HTMLButtonElement
      btn.click()

      expect(callbacks.onDelete).toHaveBeenCalledOnce()
      expect(callbacks.onDelete).toHaveBeenCalledWith('header-1')
    })

    it('should handle multiple changes to same header', () => {
      const headerInput = container.querySelector('[data-role="header"]') as HTMLInputElement
      const valueInput = container.querySelector('[data-role="value"]') as HTMLInputElement

      headerInput.value = 'New-Header'
      headerInput.dispatchEvent(new Event('input', { bubbles: true }))
      expect(callbacks.onChange).toHaveBeenCalledTimes(1)

      valueInput.value = 'new-value'
      valueInput.dispatchEvent(new Event('input', { bubbles: true }))
      expect(callbacks.onChange).toHaveBeenCalledTimes(2)

      const checkbox = container.querySelector('[data-role="enabled"]') as HTMLInputElement
      checkbox.checked = false
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))
      expect(callbacks.onChange).toHaveBeenCalledTimes(3)
    })

    it('should handle rapid toggling of enabled checkbox', () => {
      const checkbox = container.querySelector('[data-role="enabled"]') as HTMLInputElement

      checkbox.checked = false
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))
      checkbox.checked = true
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))
      checkbox.checked = false
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))

      expect(callbacks.onChange).toHaveBeenCalledTimes(3)
      expect(callbacks.onChange).toHaveBeenNthCalledWith(1, 'header-1', 'enabled', false)
      expect(callbacks.onChange).toHaveBeenNthCalledWith(2, 'header-1', 'enabled', true)
      expect(callbacks.onChange).toHaveBeenNthCalledWith(3, 'header-1', 'enabled', false)
    })
  })

  describe('header updates', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should update header data', () => {
      const newHeader = createTestHeader({
        id: 'header-1',
        header: 'X-Custom',
        value: 'custom-value',
      })

      component.updateHeader(newHeader)

      const headerInput = container.querySelector('[data-role="header"]') as HTMLInputElement
      const valueInput = container.querySelector('[data-role="value"]') as HTMLInputElement

      expect(headerInput.value).toBe('X-Custom')
      expect(valueInput.value).toBe('custom-value')
    })

    it('should update enabled state', () => {
      const newHeader = createTestHeader({
        id: 'header-1',
        enabled: false,
      })

      component.updateHeader(newHeader)

      const checkbox = container.querySelector('[data-role="enabled"]') as CheckboxElement
      expect(checkbox.checked).toBe(false)
    })

    it('should preserve event handlers after update', () => {
      // First interaction
      let headerInput = container.querySelector('[data-role="header"]') as HTMLInputElement
      headerInput.value = 'First-Header'
      headerInput.dispatchEvent(new Event('input', { bubbles: true }))
      expect(callbacks.onChange).toHaveBeenCalledTimes(1)

      // Update header
      component.updateHeader(createTestHeader({ id: 'header-1', header: 'Updated-Header' }))

      // Second interaction should still work
      headerInput = container.querySelector('[data-role="header"]') as HTMLInputElement
      headerInput.value = 'Second-Header'
      headerInput.dispatchEvent(new Event('input', { bubbles: true }))
      expect(callbacks.onChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('getter methods', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should return current header via getHeader()', () => {
      const retrieved = component.getHeader()
      expect(retrieved.id).toBe('header-1')
      expect(retrieved.header).toBe('Authorization')
      expect(retrieved.value).toBe('Bearer token123')
    })

    it('should return updated header after updateHeader()', () => {
      const newHeader = createTestHeader({
        id: 'header-1',
        header: 'X-New',
        value: 'new-value',
      })

      component.updateHeader(newHeader)

      const retrieved = component.getHeader()
      expect(retrieved.header).toBe('X-New')
      expect(retrieved.value).toBe('new-value')
    })

    it('should return correct header type', () => {
      expect(component.isRequestHeader()).toBe(true)

      const resComponent = new HeaderRowComponent(header, callbacks, false)
      expect(resComponent.isRequestHeader()).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle very long header names', () => {
      const longName = 'X-' + 'A'.repeat(500)
      header.header = longName
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const input = container.querySelector('[data-role="header"]') as HTMLInputElement
      expect(input.value).toBe(longName)
    })

    it('should handle very long header values', () => {
      const longValue = 'Bearer ' + 'a'.repeat(500)
      header.value = longValue
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const input = container.querySelector('[data-role="value"]') as HTMLInputElement
      expect(input.value).toBe(longValue)
    })

    it('should handle empty header name', () => {
      header.header = ''
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const input = container.querySelector('[data-role="header"]') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle empty header value', () => {
      header.value = ''
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const input = container.querySelector('[data-role="value"]') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle special characters in header name', () => {
      const specialName = 'X-Custom_Header-Name'
      header.header = specialName
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const input = container.querySelector('[data-role="header"]') as HTMLInputElement
      expect(input.value).toBe(specialName)
    })

    it('should handle special characters in header value', () => {
      const specialValue = 'Bearer abc-123_xyz.token'
      header.value = specialValue
      component = new HeaderRowComponent(header, callbacks, true)
      component.mount(container)

      const input = container.querySelector('[data-role="value"]') as HTMLInputElement
      expect(input.value).toBe(specialValue)
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should have button with title attribute', () => {
      const btn = container.querySelector('[data-action="removeHeader"]')
      expect(btn?.getAttribute('title')).toBe('Delete header')
    })

    it('should have enabled checkbox with title', () => {
      const checkbox = container.querySelector('[data-role="enabled"]')
      expect(checkbox?.getAttribute('title')).toBe('Enable/disable this header')
    })

    it('should have semantic input elements', () => {
      const inputs = container.querySelectorAll('input[type="text"]')
      expect(inputs.length).toBe(2) // header name and value
    })

    it('should have checkbox for toggling enabled state', () => {
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toBeDefined()
    })
  })

  describe('request vs response headers', () => {
    it('should mark request headers correctly', () => {
      const reqComponent = new HeaderRowComponent(header, callbacks, true)
      expect(reqComponent.isRequestHeader()).toBe(true)

      const container2 = document.createElement('div')
      document.body.appendChild(container2)
      reqComponent.mount(container2)

      expect(container2.querySelector('[data-kind="req"]')).toBeDefined()

      reqComponent.unmount()
      document.body.removeChild(container2)
    })

    it('should mark response headers correctly', () => {
      const resComponent = new HeaderRowComponent(header, callbacks, false)
      expect(resComponent.isRequestHeader()).toBe(false)

      const container2 = document.createElement('div')
      document.body.appendChild(container2)
      resComponent.mount(container2)

      expect(container2.querySelector('[data-kind="res"]')).toBeDefined()

      resComponent.unmount()
      document.body.removeChild(container2)
    })
  })

  describe('multiple instances', () => {
    it('should manage separate state for multiple headers', () => {
      const table1 = document.createElement('table')
      const tbody1 = document.createElement('tbody')
      table1.appendChild(tbody1)
      document.body.appendChild(table1)

      const table2 = document.createElement('table')
      const tbody2 = document.createElement('tbody')
      table2.appendChild(tbody2)
      document.body.appendChild(table2)

      const header1 = createTestHeader({ id: 'h1', header: 'Authorization' })
      const header2 = createTestHeader({ id: 'h2', header: 'X-Custom' })

      const comp1 = new HeaderRowComponent(header1, createMockCallbacks(), true)
      const comp2 = new HeaderRowComponent(header2, createMockCallbacks(), true)

      comp1.mount(tbody1)
      comp2.mount(tbody2)

      const input1 = tbody1.querySelector('[data-role="header"]') as HTMLInputElement
      const input2 = tbody2.querySelector('[data-role="header"]') as HTMLInputElement

      expect(input1.value).toBe('Authorization')
      expect(input2.value).toBe('X-Custom')

      comp1.unmount()
      comp2.unmount()
      document.body.removeChild(table1)
      document.body.removeChild(table2)
    })
  })
})
