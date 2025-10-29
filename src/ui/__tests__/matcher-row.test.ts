import { describe, it, expect } from 'vitest'
import { matcherRow } from '../components/matcher-row'

describe('matcherRow', () => {
  describe('basic rendering', () => {
    it('should render a complete matcher row with required structure', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
      })

      // Verify main structure
      expect(html).toContain('data-mid="matcher-1"')
      expect(html).toContain('data-role="urlFilter"')
      expect(html).toContain('data-role="types"')

      // Verify input elements
      expect(html).toContain('value="example.com"')
      expect(html).toContain('placeholder="Leave empty for all domains"')
    })

    it('should render trash icon for delete button', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
      })

      expect(html).toContain('data-action="removeMatcher"')
      expect(html).toContain('title="Remove matcher"')
      expect(html).toContain('<svg')
      expect(html).toContain('</svg>')
    })
  })

  describe('URL filter handling', () => {
    it('should display empty string when urlFilter is "*"', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: '*',
      })

      expect(html).toContain('value=""')
    })

    it('should preserve regular domain URLs', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'api.example.com/v1',
      })

      expect(html).toContain('value="api.example.com/v1"')
    })

    it('should escape HTML special characters in urlFilter', () => {
      const testCases = [
        {
          input: 'example.com?search=<script>',
          expected: 'value="example.com?search=&lt;script&gt;"',
        },
        {
          input: 'example.com?param="value"',
          expected: 'value="example.com?param=&quot;value&quot;"',
        },
        {
          input: 'example.com?foo=bar&baz=qux',
          expected: 'value="example.com?foo=bar&amp;baz=qux"',
        },
      ]

      testCases.forEach(({ input, expected }) => {
        const html = matcherRow({ id: 'test', urlFilter: input })
        expect(html).toContain(expected)
        // Ensure unescaped version is not present
        expect(html).not.toContain(`value="${input}"`)
      })
    })

    it('should handle edge case URLs', () => {
      const edgeCases = [
        '',
        'localhost',
        'localhost:3000',
        '*.example.com',
        'example.com/*',
        'regex:example\\.com',
      ]

      edgeCases.forEach((url) => {
        const html = matcherRow({ id: 'test', urlFilter: url })
        expect(html).toContain(`value="${url === '*' ? '' : url}"`)
      })
    })
  })

  describe('resource type filtering', () => {
    it('should render all 8 resource type options', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
      })

      const resourceTypes = [
        'All request types',
        'XHR/Fetch',
        'Scripts',
        'Stylesheets',
        'Images',
        'Fonts',
        'Documents',
        'Iframes',
      ]

      resourceTypes.forEach((type) => {
        expect(html).toContain(type)
      })
    })

    it('should select single resource type', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
        resourceTypes: ['xmlhttprequest'],
      })

      expect(html).toContain('<option value="xmlhttprequest" selected>')
      expect(html).not.toContain('<option value="script" selected>')
    })

    it('should select multiple resource types', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
        resourceTypes: ['script', 'stylesheet', 'image', 'font'],
      })

      expect(html).toContain('<option value="script" selected>')
      expect(html).toContain('<option value="stylesheet" selected>')
      expect(html).toContain('<option value="image" selected>')
      expect(html).toContain('<option value="font" selected>')

      // Unselected types should not have selected attribute
      expect(html).toContain('<option value="xmlhttprequest" >')
      expect(html).toContain('<option value="document" >')
    })

    it('should handle all resource types being selected', () => {
      const allTypes = [
        'xmlhttprequest',
        'script',
        'stylesheet',
        'image',
        'font',
        'document',
        'sub_frame',
      ]

      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
        resourceTypes: allTypes,
      })

      allTypes.forEach((type) => {
        expect(html).toContain(`<option value="${type}" selected>`)
      })
    })

    it('should have empty resourceTypes array by default', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
        resourceTypes: [],
      })

      // No resource type should be selected
      expect(html).not.toContain('selected>')
    })
  })

  describe('styling and layout', () => {
    it('should have correct CSS classes for table row layout', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
      })

      expect(html).toContain('hover:bg-white/3 transition-colors')
      expect(html).toContain('<tr')
      expect(html).toContain('<td')
    })

    it('should have proper input styling', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
      })

      // URL filter input should be full-width in table cell with left-rounded corners
      expect(html).toContain('w-full rounded-l-md bg-white/5')

      // Resource type select should be full-width in table cell with right-rounded corners
      expect(html).toContain('w-full rounded-r-md bg-white/5 px-3 py-2 text-sm text-text outline-1')
    })

    it('should have consistent focus styles', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
      })

      expect(html).toContain('focus:outline-2')
      expect(html).toContain('focus:-outline-offset-2')
      expect(html).toContain('focus:outline-blue-500')
    })
  })

  describe('accessibility', () => {
    it('should have proper data attributes for testing', () => {
      const html = matcherRow({
        id: 'unique-matcher-id',
        urlFilter: 'example.com',
      })

      expect(html).toContain('data-mid="unique-matcher-id"')
      expect(html).toContain('data-role="urlFilter"')
      expect(html).toContain('data-role="types"')
    })

    it('should have meaningful button title attribute', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
      })

      expect(html).toContain('title="Remove matcher"')
    })

    it('should have placeholder text for inputs', () => {
      const html = matcherRow({
        id: 'matcher-1',
        urlFilter: 'example.com',
      })

      expect(html).toContain('placeholder="Leave empty for all domains"')
    })
  })

  describe('ID preservation', () => {
    it('should preserve unique matcher IDs', () => {
      const ids = ['id-1', 'id-2', 'custom-123', 'matcher-abc-def']

      ids.forEach((id) => {
        const html = matcherRow({
          id,
          urlFilter: 'example.com',
        })
        expect(html).toContain(`data-mid="${id}"`)
      })
    })
  })

  describe('complex scenarios', () => {
    it('should handle matcher with all properties set', () => {
      const html = matcherRow({
        id: 'full-matcher',
        urlFilter: 'api.example.com:8080/v1/*',
        label: 'Production API',
        resourceTypes: ['xmlhttprequest', 'script'],
      })

      expect(html).toContain('data-mid="full-matcher"')
      expect(html).toContain('value="api.example.com:8080/v1/*"')
      expect(html).toContain('<option value="xmlhttprequest" selected>')
      expect(html).toContain('<option value="script" selected>')
    })

    it('should produce valid HTML structure', () => {
      const html = matcherRow({
        id: 'test',
        urlFilter: 'example.com',
        resourceTypes: ['xmlhttprequest'],
      })

      // Verify structure contains required elements
      expect(html).toContain('<tr')
      expect(html).toContain('</tr>')
      expect(html).toContain('<td')
      expect(html).toContain('</td>')
      expect(html).toContain('<input')
      expect(html).toContain('<select')
      expect(html).toContain('</select>')
      expect(html).toContain('<button')
      expect(html).toContain('</button>')

      // Verify no unclosed tags
      const openTrs = (html.match(/<tr/g) || []).length
      const closeTrs = (html.match(/<\/tr>/g) || []).length
      expect(openTrs).toBe(closeTrs)
      const openTds = (html.match(/<td/g) || []).length
      const closeTds = (html.match(/<\/td>/g) || []).length
      expect(openTds).toBe(closeTds)
    })
  })
})
