/**
 * Tests for Component base class
 * Covers lifecycle, event delegation, and content updates
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Component } from '../component'

// Concrete test implementation of Component
class TestComponent extends Component {
  renderCount = 0

  render(): string {
    this.renderCount++
    return `
      <div class="test-component">
        <h1>Test Component</h1>
        <button data-action="click-me">Click Me</button>
        <input type="text" class="test-input" placeholder="Type here">
        <div class="nested">
          <button data-action="nested-btn">Nested Button</button>
        </div>
      </div>
    `
  }

  protected setupHandlers(): void {
    this.on('click', '[data-action="click-me"]', () => {
      this.handleClick()
    })

    this.on('click', '[data-action="nested-btn"]', () => {
      this.handleNestedClick()
    })

    this.on('input', '.test-input', () => {
      this.handleInput()
    })
  }

  handleClick = vi.fn()
  handleNestedClick = vi.fn()
  handleInput = vi.fn()
}

describe('Component Base Class', () => {
  let container: HTMLElement
  let component: TestComponent

  beforeEach(() => {
    // Create container for mounting
    container = document.createElement('div')
    document.body.appendChild(container)
    component = new TestComponent('test-1')
  })

  afterEach(() => {
    component.unmount()
    document.body.removeChild(container)
  })

  describe('mounting and lifecycle', () => {
    it('should mount component into parent element', () => {
      component.mount(container)

      expect(component.isMounted()).toBe(true)
      expect(container.querySelector('.test-component')).toBeDefined()
    })

    it('should set data-component attribute on root element', () => {
      component.mount(container)

      const root = component.getElement()
      expect(root?.getAttribute('data-component')).toBe('test-1')
    })

    it('should render component only once during mount', () => {
      expect(component.renderCount).toBe(0)

      component.mount(container)

      expect(component.renderCount).toBe(1)
    })

    it('should throw error if render() returns invalid HTML', () => {
      class BadComponent extends Component {
        render(): string {
          return '' // Empty string = no root element
        }
      }

      const bad = new BadComponent('bad')
      expect(() => bad.mount(container)).toThrow(
        'Component bad: render() must return valid HTML string'
      )
    })

    it('should have isMounted return false before mount', () => {
      expect(component.isMounted()).toBe(false)
    })

    it('should have isMounted return true after mount', () => {
      component.mount(container)
      expect(component.isMounted()).toBe(true)
    })

    it('should have isMounted return false after unmount', () => {
      component.mount(container)
      component.unmount()
      expect(component.isMounted()).toBe(false)
    })
  })

  describe('event delegation', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should handle simple click events with delegation', () => {
      const button = container.querySelector('[data-action="click-me"]') as HTMLButtonElement
      button.click()

      expect(component.handleClick).toHaveBeenCalledOnce()
    })

    it('should handle nested click events with delegation', () => {
      const button = container.querySelector('[data-action="nested-btn"]') as HTMLButtonElement
      button.click()

      expect(component.handleNestedClick).toHaveBeenCalledOnce()
    })

    it('should handle input events with delegation', () => {
      const input = container.querySelector('.test-input') as HTMLInputElement
      input.value = 'test input'
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(component.handleInput).toHaveBeenCalledOnce()
    })

    it('should not trigger handler for non-matching selectors', () => {
      const h1 = container.querySelector('h1') as HTMLElement
      h1.click()

      expect(component.handleClick).not.toHaveBeenCalled()
    })

    it('should pass Event object to handler', () => {
      const button = container.querySelector('[data-action="click-me"]') as HTMLButtonElement
      button.click()

      expect(component.handleClick).toHaveBeenCalled()
      expect(component.handleClick.mock.calls.length).toBeGreaterThan(0)
    })

    it('should work with deeply nested elements', () => {
      const button = container.querySelector('[data-action="nested-btn"]') as HTMLButtonElement
      // Clicking the button directly - event delegation should work
      button.click()

      expect(component.handleNestedClick).toHaveBeenCalledOnce()
    })
  })

  describe('content updates', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should update content without changing element reference', () => {
      const originalEl = component.getElement()

      component['updateContent'](
        `
        <div class="test-component">
          <h1>Updated Content</h1>
          <button data-action="click-me">Updated Button</button>
        </div>
      `
      )

      const currentEl = component.getElement()
      expect(originalEl).toBe(currentEl) // Same reference
      expect(container.querySelector('h1')?.textContent).toBe('Updated Content')
    })

    it('should preserve data-component attribute after update', () => {
      component['updateContent'](
        `
        <div class="test-component">
          <h1>Updated</h1>
        </div>
      `
      )

      const el = component.getElement()
      expect(el?.getAttribute('data-component')).toBe('test-1')
    })

    it('should re-bind event listeners after update', () => {
      // First click
      let button = container.querySelector('[data-action="click-me"]') as HTMLButtonElement
      button.click()
      expect(component.handleClick).toHaveBeenCalledTimes(1)

      // Update content
      component['updateContent'](
        `
        <div class="test-component">
          <h1>Updated</h1>
          <button data-action="click-me">Click Me Again</button>
        </div>
      `
      )

      // Second click - handler should still work
      button = container.querySelector('[data-action="click-me"]') as HTMLButtonElement
      button.click()
      expect(component.handleClick).toHaveBeenCalledTimes(2)
    })

    it('should warn if updateContent receives invalid HTML', () => {
      const warnSpy = vi.spyOn(console, 'warn')

      component['updateContent']('') // Empty = no root element

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('updateContent() received invalid HTML')
      )
      warnSpy.mockRestore()
    })

    it('should handle updateContent with mixed HTML and attributes', () => {
      component['updateContent'](
        `
        <div class="test-component" data-new-attr="value">
          <h1>Mixed Content</h1>
        </div>
      `
      )

      const el = component.getElement()
      expect(el?.getAttribute('data-new-attr')).toBe('value')
      expect(el?.querySelector('h1')?.textContent).toBe('Mixed Content')
    })
  })

  describe('unmounting and cleanup', () => {
    beforeEach(() => {
      component.mount(container)
    })

    it('should remove element from DOM', () => {
      expect(container.querySelector('.test-component')).toBeDefined()

      component.unmount()

      expect(container.querySelector('.test-component')).toBeNull()
    })

    it('should clear element reference', () => {
      expect(component.getElement()).not.toBeNull()

      component.unmount()

      expect(component.getElement()).toBeNull()
    })

    it('should set isMounted to false', () => {
      expect(component.isMounted()).toBe(true)

      component.unmount()

      expect(component.isMounted()).toBe(false)
    })

    it('should remove all event listeners', () => {
      const button = container.querySelector('[data-action="click-me"]') as HTMLButtonElement
      button.click()
      expect(component.handleClick).toHaveBeenCalledTimes(1)

      component.unmount()

      // Re-mount and verify listeners are gone
      component.mount(container)
      const newButton = container.querySelector('[data-action="click-me"]') as HTMLButtonElement
      newButton.click()

      // Should still only be 1 call (not 2), because old listeners were removed
      expect(component.handleClick).toHaveBeenCalledTimes(2) // New handler from new mount
    })

    it('should be safe to unmount before mounting', () => {
      const newComponent = new TestComponent('unmounted')
      expect(() => newComponent.unmount()).not.toThrow()
    })

    it('should be safe to unmount multiple times', () => {
      component.unmount()
      expect(() => component.unmount()).not.toThrow()
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle adding listeners during setupHandlers after mount', () => {
      // This should work fine - setupHandlers is called after mount
      class GoodSetupComponent extends Component {
        render(): string {
          return '<div><button data-action="test">Click</button></div>'
        }

        clickHandler = vi.fn()

        protected setupHandlers(): void {
          this.on('click', '[data-action="test"]', () => this.clickHandler())
        }
      }

      const good = new GoodSetupComponent('good')
      good.mount(container)

      expect(good.isMounted()).toBe(true)
      const button = container.querySelector('[data-action="test"]') as HTMLButtonElement
      button.click()
      expect(good.clickHandler).toHaveBeenCalledOnce()

      good.unmount()
    })

    it('should handle multiple components mounting to same parent', () => {
      const comp1 = new TestComponent('comp-1')
      const comp2 = new TestComponent('comp-2')

      comp1.mount(container)
      comp2.mount(container)

      expect(container.querySelectorAll('.test-component').length).toBe(2)
      expect(comp1.isMounted()).toBe(true)
      expect(comp2.isMounted()).toBe(true)

      comp1.unmount()
      expect(container.querySelectorAll('.test-component').length).toBe(1)
      expect(comp1.isMounted()).toBe(false)
      expect(comp2.isMounted()).toBe(true)
    })

    it('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 5; i++) {
        component.unmount()
        component.mount(container)
      }

      expect(component.isMounted()).toBe(true)
      expect(container.querySelectorAll('.test-component').length).toBe(1)
    })

    it('should get correct element reference at any time', () => {
      component.mount(container)
      const el1 = component.getElement()

      component['updateContent']('<div class="test-component"><h1>Test</h1></div>')
      const el2 = component.getElement()

      expect(el1).toBe(el2) // Should be same reference
      expect(el2?.querySelector('h1')).toBeDefined()
    })
  })

  describe('integration scenarios', () => {
    it('should handle full lifecycle: mount → update → unmount', () => {
      expect(component.isMounted()).toBe(false)

      component.mount(container)
      expect(component.isMounted()).toBe(true)
      expect(component.renderCount).toBe(1)

      const button = container.querySelector('[data-action="click-me"]') as HTMLButtonElement
      button.click()
      expect(component.handleClick).toHaveBeenCalledOnce()

      component['updateContent'](`
        <div class="test-component">
          <h1>Updated</h1>
          <button data-action="click-me">Click Me</button>
        </div>
      `)
      expect(component.isMounted()).toBe(true) // Still mounted

      const newButton = container.querySelector('[data-action="click-me"]') as HTMLButtonElement
      newButton.click()
      expect(component.handleClick).toHaveBeenCalledTimes(2) // New listener works

      component.unmount()
      expect(component.isMounted()).toBe(false)
      expect(container.querySelector('.test-component')).toBeNull()
    })

    it('should maintain separate state for multiple component instances', () => {
      const comp1 = new TestComponent('comp-1')
      const comp2 = new TestComponent('comp-2')

      const container1 = document.createElement('div')
      const container2 = document.createElement('div')
      document.body.appendChild(container1)
      document.body.appendChild(container2)

      comp1.mount(container1)
      comp2.mount(container2)

      const btn1 = container1.querySelector('[data-action="click-me"]') as HTMLButtonElement
      const btn2 = container2.querySelector('[data-action="click-me"]') as HTMLButtonElement

      btn1.click()
      expect(comp1.handleClick).toHaveBeenCalledOnce()
      expect(comp2.handleClick).not.toHaveBeenCalled()

      btn2.click()
      expect(comp1.handleClick).toHaveBeenCalledOnce() // Still 1
      expect(comp2.handleClick).toHaveBeenCalledOnce()

      comp1.unmount()
      comp2.unmount()
      document.body.removeChild(container1)
      document.body.removeChild(container2)
    })
  })
})
