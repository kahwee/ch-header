import { describe, it, expect } from 'vitest'
import { sectionHeader } from '../section-header'

describe('sectionHeader', () => {
  describe('rendering', () => {
    it('should render section header with title', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('Matchers')
      expect(html).toContain('section-header')
    })

    it('should render label with correct classes', () => {
      const html = sectionHeader({
        title: 'Request headers',
        addButtonId: 'addReq',
        addButtonTitle: 'Add header',
        menuItems: [
          { label: 'Sort A-Z', action: 'sortReqHeaders' },
          { label: 'Clear all', action: 'clearReqHeaders' },
        ],
      })

      expect(html).toContain('section-header__title')
      expect(html).toContain('Request headers')
    })

    it('should render divider line', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('section-header__rule')
      expect(html).toContain('aria-hidden="true"')
    })
  })

  describe('add button', () => {
    it('should render add button with correct id', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('id="addMatcher"')
    })

    it('should render add button with correct title', () => {
      const html = sectionHeader({
        title: 'Request headers',
        addButtonId: 'addReq',
        addButtonTitle: 'Add header',
        menuItems: [{ label: 'Clear all', action: 'clearReqHeaders' }],
      })

      expect(html).toContain('title="Add header"')
    })

    it('should have primary button styling', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('button--primary')
      expect(html).toContain('button--primary')
      expect(html).toContain('button--primary')
    })

    it('should include icon in add button', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('<svg')
      expect(html).toContain('</svg>')
    })
  })

  describe('dropdown menu', () => {
    it('should infer options title from section title', () => {
      const html = sectionHeader({
        title: 'Request headers',
        addButtonId: 'addReq',
        addButtonTitle: 'Add header',
        menuItems: [{ label: 'Clear all', action: 'clearReqHeaders' }],
      })

      expect(html).toContain('title="Request headers options"')
    })

    it('should render dropdown button', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('<div class="dropdown"')
      expect(html).toContain('</div>')
    })

    it('should render menu items from array', () => {
      const html = sectionHeader({
        title: 'Request headers',
        addButtonId: 'addReq',
        addButtonTitle: 'Add header',
        menuItems: [
          { label: 'Sort A-Z', action: 'sortReqHeaders' },
          { label: 'Clear all', action: 'clearReqHeaders' },
        ],
      })

      expect(html).toContain('Sort A-Z')
      expect(html).toContain('Clear all')
    })

    it('should render correct data-action for each menu item', () => {
      const html = sectionHeader({
        title: 'Response headers',
        addButtonId: 'addRes',
        addButtonTitle: 'Add header',
        menuItems: [
          { label: 'Sort A-Z', action: 'sortResHeaders' },
          { label: 'Clear all', action: 'clearResHeaders' },
        ],
      })

      expect(html).toContain('data-action="sortResHeaders"')
      expect(html).toContain('data-action="clearResHeaders"')
    })

    it('should support single menu item (matchers)', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('data-action="clearMatchers"')
      expect(html).not.toContain('Sort A-Z')
    })

    it('should support multiple menu items (headers)', () => {
      const html = sectionHeader({
        title: 'Request headers',
        addButtonId: 'addReq',
        addButtonTitle: 'Add header',
        menuItems: [
          { label: 'Sort A-Z', action: 'sortReqHeaders' },
          { label: 'Clear all', action: 'clearReqHeaders' },
          { label: 'Delete selected', action: 'deleteReqHeaders' },
        ],
      })

      expect(html).toContain('Sort A-Z')
      expect(html).toContain('Clear all')
      expect(html).toContain('Delete selected')
    })

    it('should have correct menu styling', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('dropdown__menu')
      expect(html).toContain('menu-item')
      expect(html).toContain('menu-item')
    })
  })

  describe('common use cases', () => {
    it('should work for matchers section', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('Matchers')
      expect(html).toContain('id="addMatcher"')
      expect(html).toContain('data-action="clearMatchers"')
      expect(html).toContain('Matchers options')
    })

    it('should work for request headers section', () => {
      const html = sectionHeader({
        title: 'Request headers',
        addButtonId: 'addReq',
        addButtonTitle: 'Add header',
        menuItems: [
          { label: 'Sort A-Z', action: 'sortReqHeaders' },
          { label: 'Clear all', action: 'clearReqHeaders' },
        ],
      })

      expect(html).toContain('Request headers')
      expect(html).toContain('id="addReq"')
      expect(html).toContain('data-action="sortReqHeaders"')
      expect(html).toContain('data-action="clearReqHeaders"')
      expect(html).toContain('Request headers options')
    })

    it('should work for response headers section', () => {
      const html = sectionHeader({
        title: 'Response headers',
        addButtonId: 'addRes',
        addButtonTitle: 'Add header',
        menuItems: [
          { label: 'Sort A-Z', action: 'sortResHeaders' },
          { label: 'Clear all', action: 'clearResHeaders' },
        ],
      })

      expect(html).toContain('Response headers')
      expect(html).toContain('id="addRes"')
      expect(html).toContain('data-action="sortResHeaders"')
      expect(html).toContain('data-action="clearResHeaders"')
      expect(html).toContain('Response headers options')
    })
  })

  describe('HTML structure', () => {
    it('should render valid HTML', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toMatch(/<div[^>]*class="section-header/)
      expect(html).toContain('</div>')
      expect(html).toMatch(/<div class="dropdown"/)
      expect(html).toContain('</div>')
    })

    it('should have proper flex layout', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('section-header__actions')
    })
  })

  describe('edge cases', () => {
    it('should handle empty menu items array', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [],
      })

      expect(html).toContain('Matchers')
      expect(html).toContain('addMatcher')
      expect(html).toContain('<div class="dropdown__menu"')
      expect(html).toContain('<div>\n        \n      </div>')
    })

    it('should handle special characters in title', () => {
      const html = sectionHeader({
        title: 'Headers & Matchers',
        addButtonId: 'addItem',
        addButtonTitle: 'Add item',
        menuItems: [{ label: 'Clear all', action: 'clearAll' }],
      })

      expect(html).toContain('Headers & Matchers')
      expect(html).toContain('Headers & Matchers options')
    })

    it('should handle long menu item labels', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all selected matchers', action: 'clearMatchers' }],
      })

      expect(html).toContain('Clear all selected matchers')
    })
  })
})
