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
      expect(html).toContain('relative flex items-center justify-between')
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

      expect(html).toContain('bg-bg pr-3 text-sm font-semibold text-white whitespace-nowrap')
      expect(html).toContain('Request headers')
    })

    it('should render divider line', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('border-t border-white/15')
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

      expect(html).toContain('bg-blue-500')
      expect(html).toContain('text-white')
      expect(html).toContain('hover:bg-blue-600')
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

      expect(html).toContain('<el-dropdown')
      expect(html).toContain('</el-dropdown>')
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

      expect(html).toContain('w-48 origin-top-right rounded-md bg-stone-800')
      expect(html).toContain('px-4 py-2 text-left text-sm text-gray-300')
      expect(html).toContain('hover:bg-white/5 hover:text-white')
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

      expect(html).toMatch(/<div[^>]*class="relative/)
      expect(html).toContain('</div>')
      expect(html).toMatch(/<el-dropdown/)
      expect(html).toContain('</el-dropdown>')
    })

    it('should have proper flex layout', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('flex w-full items-center gap-2')
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
      expect(html).toContain('<el-menu')
      expect(html).toContain('<div class="py-1">\n        \n      </div>')
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
