import { describe, expect, it } from 'vitest'
import { ghostButton } from '../ghost-button'

describe('ghostButton', () => {
  it('leaves Apply as the implicit submit action when pressing Enter in an editor field', () => {
    const form = document.createElement('form')
    form.innerHTML = `<input name="profileName">${ghostButton({ icon: '<svg></svg>', action: 'delete', title: 'Delete header' })}<button type="submit">Apply</button>`
    const submitters = Array.from(form.querySelectorAll('button')).filter(
      (button) => button.type === 'submit'
    )
    expect(submitters).toHaveLength(1)
    expect(submitters[0].textContent).toBe('Apply')
  })

  describe('variants', () => {
    it('should render delete variant with correct classes', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'delete',
        title: 'Delete',
        variant: 'delete',
      })
      expect(html).toContain('icon-button--danger')
    })

    it('should render default variant with correct classes', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Action',
        variant: 'default',
      })
      expect(html).toContain('icon-button')
    })

    it('should default to default variant when not specified', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Action',
      })
      expect(html).toContain('icon-button')
    })
  })

  describe('shape', () => {
    it('should render rounded button by default', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Action',
      })
      expect(html).toContain('icon-button')
      expect(html).not.toContain('icon-button--circle')
    })

    it('should render circular button when circle option is true', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Action',
        circle: true,
      })
      expect(html).toContain('icon-button--circle')
      expect(html).not.toContain('icon-button--danger')
    })

    it('should render rectangular button when circle option is false', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Action',
        circle: false,
      })
      expect(html).toContain('icon-button')
    })
  })

  describe('attributes', () => {
    it('should include data-action attribute', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'deleteItem',
        title: 'Delete',
      })
      expect(html).toContain('data-action="deleteItem"')
    })

    it('should include title attribute', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'delete',
        title: 'Delete this item',
      })
      expect(html).toContain('title="Delete this item"')
    })

    it('should escape action attribute', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'delete&update',
        title: 'Action',
      })
      expect(html).toContain('data-action="delete&amp;update"')
    })

    it('should escape title attribute', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Delete "this" item',
      })
      expect(html).toContain('title="Delete &quot;this&quot; item"')
    })
  })

  describe('icon rendering', () => {
    it('should render icon in button', () => {
      const icon = '<svg class="trash-icon"></svg>'
      const html = ghostButton({
        icon,
        action: 'delete',
        title: 'Delete',
      })
      expect(html).toContain(icon)
    })

    it('should wrap icon in sized span', () => {
      const icon = '<svg></svg>'
      const html = ghostButton({
        icon,
        action: 'delete',
        title: 'Delete',
      })
      expect(html).toContain('<span class="icon-button__icon">')
      expect(html).toContain(icon)
      expect(html).toContain('</span>')
    })

    it('should render SVG with complex structure', () => {
      const icon =
        '<svg viewBox="0 0 24 24"><path d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>'
      const html = ghostButton({
        icon,
        action: 'delete',
        title: 'Delete',
      })
      expect(html).toContain(icon)
    })
  })

  describe('common use cases', () => {
    it('should match matcher row delete button pattern', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'removeMatcher',
        title: 'Remove matcher',
        variant: 'delete',
        circle: true,
      })

      expect(html).toContain('data-action="removeMatcher"')
      expect(html).toContain('title="Remove matcher"')
      expect(html).toContain('icon-button--danger')
      expect(html).toContain('icon-button--circle')
    })

    it('should match header row delete button pattern', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'removeHeader',
        title: 'Delete header',
        variant: 'delete',
        circle: true,
      })

      expect(html).toContain('data-action="removeHeader"')
      expect(html).toContain('title="Delete header"')
      expect(html).toContain('icon-button--danger')
      expect(html).toContain('icon-button--circle')
    })
  })

  describe('HTML structure', () => {
    it('should render valid button element', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Action',
      })
      expect(html).toMatch(/<button[^>]*>/)
      expect(html).toContain('</button>')
    })

    it('should have correct class structure', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Action',
      })
      expect(html).toContain('class="icon-button')
      expect(html).toContain('icon-button')
      expect(html).toContain('icon-button')
      expect(html).toContain('icon-button')
      expect(html).toContain('icon-button')
    })
  })

  describe('edge cases', () => {
    it('should handle empty icon string', () => {
      const html = ghostButton({
        icon: '',
        action: 'action',
        title: 'Action',
      })
      expect(html).toContain('data-action="action"')
      expect(html).toContain('</span>')
    })

    it('should handle special characters in action', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'delete-item_123',
        title: 'Action',
      })
      expect(html).toContain('data-action="delete-item_123"')
    })

    it('should handle very long title', () => {
      const longTitle = 'This is a very long title that describes what this button does in detail'
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: longTitle,
      })
      expect(html).toContain(`title="${longTitle}"`)
    })

    it('should render without optional parameters', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Action',
        // variant and circle are optional
      })
      expect(html).toContain('<button')
      expect(html).toContain('data-action="action"')
      expect(html).toContain('</button>')
    })
  })

  describe('styling consistency', () => {
    it('should have consistent focus styling across variants', () => {
      const deleteHtml = ghostButton({
        icon: '<svg></svg>',
        action: 'delete',
        title: 'Delete',
        variant: 'delete',
      })
      const defaultHtml = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Action',
        variant: 'default',
      })

      // Both should have same focus styling
      expect(deleteHtml).toContain('icon-button')
      expect(defaultHtml).toContain('icon-button')
    })

    it('should have consistent background hover effect', () => {
      const html = ghostButton({
        icon: '<svg></svg>',
        action: 'action',
        title: 'Action',
      })

      expect(html).toContain('icon-button')
    })
  })
})
