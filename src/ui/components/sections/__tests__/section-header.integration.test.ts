import { describe, it, expect } from 'vitest'
import { sectionHeader } from '../section-header'

describe('sectionHeader - Integration Tests', () => {
  describe('Popup template integration patterns', () => {
    it('should render matchers header with correct config', () => {
      const html = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      expect(html).toContain('Matchers')
      expect(html).toContain('id="addMatcher"')
      expect(html).toContain('data-action="clearMatchers"')
      expect(html).not.toContain('Sort A-Z')
    })

    it('should render request headers with both Sort and Clear', () => {
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
    })

    it('should render response headers with both Sort and Clear', () => {
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
    })
  })

  describe('Data-driven menu pattern', () => {
    it('should render different menu items based on config', () => {
      // Matchers - single item
      const matchers = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      // Headers - two items
      const headers = sectionHeader({
        title: 'Headers',
        addButtonId: 'addHeader',
        addButtonTitle: 'Add header',
        menuItems: [
          { label: 'Sort A-Z', action: 'sortHeaders' },
          { label: 'Clear all', action: 'clearHeaders' },
        ],
      })

      // Count menu items
      const matchersMenuCount = (matchers.match(/data-action=/g) || []).length
      const headersMenuCount = (headers.match(/data-action=/g) || []).length

      expect(matchersMenuCount).toBe(1)
      expect(headersMenuCount).toBe(2)
    })

    it('should be composable with different menu items', () => {
      const customMenus = [
        { label: 'Clear all', action: 'clearMatchers' },
        { label: 'Sort A-Z', action: 'sortMatchers' },
        { label: 'Clear all', action: 'clearMatchers' },
      ]

      const html = sectionHeader({
        title: 'Custom Section',
        addButtonId: 'addCustom',
        addButtonTitle: 'Add',
        menuItems: customMenus,
      })

      customMenus.forEach((item) => {
        expect(html).toContain(item.label)
        expect(html).toContain(`data-action="${item.action}"`)
      })
    })
  })

  describe('Reusability across contexts', () => {
    it('should work in popup template context (matchers)', () => {
      const matchersSection = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      // Simulate wrapping in popup context
      const popupMarkup = `
        <div class="space-y-2 pb-4">
          ${matchersSection}
          <div id="matchers"></div>
        </div>
      `

      expect(popupMarkup).toContain('Matchers')
      expect(popupMarkup).toContain('id="matchers"')
    })

    it('should work in popup template context (headers)', () => {
      const headersSection = sectionHeader({
        title: 'Request headers',
        addButtonId: 'addReq',
        addButtonTitle: 'Add header',
        menuItems: [
          { label: 'Sort A-Z', action: 'sortReqHeaders' },
          { label: 'Clear all', action: 'clearReqHeaders' },
        ],
      })

      // Simulate wrapping in popup context
      const popupMarkup = `
        <div class="pb-4">
          <p class="mb-4 text-sm text-gray-300">HTTP headers description</p>
          ${headersSection}
          <div class="mt-4 flow-root">
            <table class="min-w-full">
              <tbody id="reqHeaders"></tbody>
            </table>
          </div>
        </div>
      `

      expect(popupMarkup).toContain('Request headers')
      expect(popupMarkup).toContain('id="reqHeaders"')
      expect(popupMarkup).toContain('HTTP headers description')
    })

    it('should work in Storybook context', () => {
      const storyMarkup = sectionHeader({
        title: 'Matchers',
        addButtonId: 'addMatcher',
        addButtonTitle: 'Add matcher',
        menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
      })

      // Verify it renders correctly in isolation
      expect(storyMarkup).toMatch(/<div[^>]*class="relative/)
      expect(storyMarkup).toContain('</div>')
      expect(storyMarkup).toMatch(/<el-dropdown/)
      expect(storyMarkup).toContain('</el-dropdown>')
    })
  })

  describe('API consistency', () => {
    it('should have consistent interface across all uses', () => {
      const configs = [
        {
          title: 'Matchers',
          addButtonId: 'addMatcher',
          addButtonTitle: 'Add matcher',
          menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
        },
        {
          title: 'Request headers',
          addButtonId: 'addReq',
          addButtonTitle: 'Add header',
          menuItems: [
            { label: 'Sort A-Z', action: 'sortReqHeaders' },
            { label: 'Clear all', action: 'clearReqHeaders' },
          ],
        },
        {
          title: 'Response headers',
          addButtonId: 'addRes',
          addButtonTitle: 'Add header',
          menuItems: [
            { label: 'Sort A-Z', action: 'sortResHeaders' },
            { label: 'Clear all', action: 'clearResHeaders' },
          ],
        },
      ]

      // All should render without errors
      configs.forEach((config) => {
        const html = sectionHeader(config)
        expect(html).toBeTruthy()
        expect(html).toContain(config.title)
        expect(html).toContain(config.addButtonId)
      })
    })
  })
})
