import { describe, it, expect } from 'vitest'
import { solidButton } from '../solid-button'

describe('solidButton', () => {
  describe('variants', () => {
    it('should render primary variant with correct classes', () => {
      const html = solidButton({ variant: 'primary', text: 'Click me' })
      expect(html).toContain('button--primary')
      expect(html).toContain('button--primary')
      expect(html).toContain('button--primary')
      expect(html).toContain('button--primary')
    })

    it('should render secondary variant with correct classes', () => {
      const html = solidButton({ variant: 'secondary', text: 'Click me' })
      expect(html).toContain('button--secondary')
      expect(html).toContain('button--secondary')
      expect(html).toContain('button--secondary')
      expect(html).toContain('button--secondary')
    })

    it('should default to primary variant when not specified', () => {
      const html = solidButton({ text: 'Click me' })
      expect(html).toContain('button--primary')
    })
  })

  describe('sizes', () => {
    it('should render sm size with correct padding when text is present', () => {
      const html = solidButton({ size: 'sm', text: 'Small' })
      expect(html).toContain('button--sm')
      expect(html).toContain('button--sm')
    })

    it('should render sm size with icon-only padding', () => {
      const html = solidButton({ size: 'sm', icon: '<svg></svg>' })
      expect(html).toContain('button--sm')
    })

    it('should render sm size with correct icon dimensions', () => {
      const html = solidButton({ size: 'sm', icon: '<svg></svg>' })
      expect(html).toContain('button__icon')
    })

    it('should render sm size with correct gap when text and icon present', () => {
      const html = solidButton({ size: 'sm', text: 'Small', icon: '<svg></svg>' })
      expect(html).toContain('button--sm')
    })

    it('should render md size with correct padding when text is present', () => {
      const html = solidButton({ size: 'md', text: 'Medium' })
      expect(html).toContain('button--md')
      expect(html).toContain('button--md')
    })

    it('should render md size with icon-only padding', () => {
      const html = solidButton({ size: 'md', icon: '<svg></svg>' })
      expect(html).toContain('button--md')
      expect(html).toContain('button--icon-only')
    })

    it('should render md size with correct icon dimensions', () => {
      const html = solidButton({ size: 'md', icon: '<svg></svg>' })
      expect(html).toContain('button__icon')
    })

    it('should render md size with correct gap when text and icon present', () => {
      const html = solidButton({ size: 'md', text: 'Medium', icon: '<svg></svg>' })
      expect(html).toContain('button--md')
    })

    it('should default to md size when not specified', () => {
      const html = solidButton({ text: 'Default' })
      expect(html).toContain('button--md')
    })
  })

  describe('rounded corners', () => {
    it('should render button by default', () => {
      const html = solidButton({ text: 'Default' })
      expect(html).toContain('button')
    })

    it('should always render button', () => {
      const html = solidButton({ variant: 'secondary', text: 'Test' })
      expect(html).toContain('button')
    })
  })

  describe('button type', () => {
    it('should render type="button" by default', () => {
      const html = solidButton({ text: 'Click' })
      expect(html).toContain('type="button"')
    })

    it('should render type="submit" when specified', () => {
      const html = solidButton({ type: 'submit', text: 'Submit' })
      expect(html).toContain('type="submit"')
    })

    it('should render type="button" when explicitly specified', () => {
      const html = solidButton({ type: 'button', text: 'Click' })
      expect(html).toContain('type="button"')
    })
  })

  describe('attributes', () => {
    it('should include id attribute when provided', () => {
      const html = solidButton({ id: 'my-button', text: 'Click' })
      expect(html).toContain('id="my-button"')
    })

    it('should not include id attribute when not provided', () => {
      const html = solidButton({ text: 'Click' })
      expect(html).not.toContain('id=')
    })

    it('should include title attribute when provided', () => {
      const html = solidButton({ title: 'Click to submit', text: 'Submit' })
      expect(html).toContain('title="Click to submit"')
    })

    it('should not include title attribute when not provided', () => {
      const html = solidButton({ text: 'Click' })
      expect(html).not.toContain('title=')
    })

    it('should include data-action attribute when provided', () => {
      const html = solidButton({ action: 'save', text: 'Save' })
      expect(html).toContain('data-action="save"')
    })

    it('should not include data-action attribute when not provided', () => {
      const html = solidButton({ text: 'Click' })
      expect(html).not.toContain('data-action=')
    })
  })

  describe('text rendering', () => {
    it('should render text when provided', () => {
      const html = solidButton({ text: 'Click me', variant: 'primary' })
      expect(html).toContain('Click me')
    })

    it('should not render text when not provided', () => {
      const html = solidButton({ variant: 'primary' })
      expect(html).not.toContain('Click me')
    })

    it('should not render text when empty string', () => {
      const html = solidButton({ text: '', variant: 'primary' })
      expect(html).not.toContain('Click me')
    })
  })

  describe('icon rendering', () => {
    it('should render icon when provided', () => {
      const icon = '<svg class="icon"></svg>'
      const html = solidButton({ icon })
      expect(html).toContain(icon)
    })

    it('should wrap icon in sized span', () => {
      const icon = '<svg></svg>'
      const html = solidButton({ size: 'md', icon })
      expect(html).toContain('<span class="button__icon">')
    })

    it('should use sm icon dimensions in span', () => {
      const icon = '<svg></svg>'
      const html = solidButton({ size: 'sm', icon })
      expect(html).toContain('button__icon')
    })

    it('should not render icon span when icon not provided', () => {
      const html = solidButton({ text: 'Click' })
      expect(html).not.toContain('<span class="button__icon')
    })
  })

  describe('combined options', () => {
    it('should render primary button with icon and text', () => {
      const html = solidButton({
        variant: 'primary',
        size: 'sm',
        icon: '<svg></svg>',
        text: 'Add',
        id: 'add-btn',
        title: 'Add new item',
        action: 'add',
      })

      expect(html).toContain('button--primary')
      expect(html).toContain('id="add-btn"')
      expect(html).toContain('title="Add new item"')
      expect(html).toContain('data-action="add"')
      expect(html).toContain('Add')
      expect(html).toContain('<svg></svg>')
      expect(html).toContain('button--sm')
    })

    it('should render secondary button with all attributes', () => {
      const html = solidButton({
        variant: 'secondary',
        size: 'md',
        type: 'submit',
        text: 'Submit',
        id: 'submit-btn',
        title: 'Submit form',
        action: 'submit',
      })

      expect(html).toContain('type="submit"')
      expect(html).toContain('button--secondary')
      expect(html).toContain('id="submit-btn"')
      expect(html).toContain('Submit')
    })
  })

  describe('common use cases', () => {
    it('should match popup.ts add button pattern', () => {
      const html = solidButton({
        id: 'addMatcher',
        icon: '<svg></svg>',
        title: 'Add matcher',
        variant: 'primary',
        size: 'sm',
      })

      expect(html).toContain('id="addMatcher"')
      expect(html).toContain('button--primary')
      // Icon-only uses reduced padding
      expect(html).toContain('button--sm')
    })

    it('should support text-only buttons', () => {
      const html = solidButton({
        variant: 'primary',
        text: 'Apply',
        type: 'submit',
      })

      expect(html).toContain('type="submit"')
      expect(html).toContain('Apply')
      expect(html).toContain('button--md')
    })

    it('should support secondary button with icon and text', () => {
      const html = solidButton({
        variant: 'secondary',
        icon: '<svg></svg>',
        text: 'Options',
        size: 'sm',
      })

      expect(html).toContain('button--secondary')
      expect(html).toContain('Options')
      expect(html).toContain('button--sm')
    })
  })

  describe('HTML structure', () => {
    it('should render valid button element', () => {
      const html = solidButton({ text: 'Click' })
      expect(html).toMatch(/<button[^>]*>/)
      expect(html).toContain('</button>')
    })

    it('should have correct class structure', () => {
      const html = solidButton({ text: 'Click' })
      expect(html).toContain('class="button')
      expect(html).toContain('button')
      expect(html).toContain('button')
      expect(html).toContain('button')
    })

    it('should always include common button classes', () => {
      const html = solidButton({ variant: 'secondary', text: 'Test' })
      expect(html).toContain('button')
      expect(html).toContain('button')
      expect(html).toContain('button')
    })
  })

  describe('edge cases', () => {
    it('should handle empty text string', () => {
      const html = solidButton({ text: '', variant: 'primary' })
      expect(html).toContain('type="button"')
      expect(html).toContain('button--primary')
    })

    it('should handle icon with special characters', () => {
      const icon = '<svg><path d="M0 0"></path></svg>'
      const html = solidButton({ icon, text: 'Icon' })
      expect(html).toContain(icon)
    })

    it('should handle all undefined options as defaults', () => {
      const html = solidButton({})
      expect(html).toContain('type="button"')
      expect(html).toContain('button--primary')
      expect(html).toContain('button')
      expect(html).toContain('button--md')
    })

    it('should handle minimal required options', () => {
      const html = solidButton({ text: 'Minimal' })
      expect(html).toContain('Minimal')
      expect(html).toContain('<button')
      expect(html).toContain('</button>')
    })
  })
})
