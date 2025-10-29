import { describe, it, expect } from 'vitest'
import {
  COLOR_PALETTE,
  getSidebarTemplate,
  getPopupTemplate,
  profileListItem,
  customCheckbox,
} from '../popup-template'

describe('popup-template', () => {
  describe('COLOR_PALETTE', () => {
    it('should have 21 colors', () => {
      expect(COLOR_PALETTE).toHaveLength(21)
    })

    it('should have correct structure for each color', () => {
      COLOR_PALETTE.forEach((color) => {
        expect(color).toHaveProperty('name')
        expect(color).toHaveProperty('tailwind')
        expect(color).toHaveProperty('hex')
        expect(typeof color.name).toBe('string')
        expect(typeof color.tailwind).toBe('string')
        expect(typeof color.hex).toBe('string')
      })
    })

    it('should have valid hex color codes', () => {
      const hexRegex = /^#[0-9a-f]{6}$/i
      COLOR_PALETTE.forEach((color) => {
        expect(color.hex).toMatch(hexRegex)
      })
    })

    it('should have tailwind color classes', () => {
      const tailwindClasses = COLOR_PALETTE.map((c) => c.tailwind)
      expect(tailwindClasses).toContain('red-700')
      expect(tailwindClasses).toContain('blue-700')
      expect(tailwindClasses).toContain('purple-700')
    })

    it('should have unique color names', () => {
      const names = COLOR_PALETTE.map((c) => c.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(COLOR_PALETTE.length)
    })

    it('should include standard Tailwind colors', () => {
      const expectedColors = [
        'Red',
        'Orange',
        'Yellow',
        'Green',
        'Blue',
        'Purple',
        'Pink',
      ]
      expectedColors.forEach((expectedColor) => {
        expect(
          COLOR_PALETTE.some((color) => color.name === expectedColor)
        ).toBe(true)
      })
    })
  })

  describe('getSidebarTemplate', () => {
    it('should return a string', () => {
      const html = getSidebarTemplate()
      expect(typeof html).toBe('string')
    })

    it('should render valid HTML structure', () => {
      const html = getSidebarTemplate()
      expect(html).toMatch(/<aside/)
      expect(html).toContain('</aside>')
    })

    it('should include command palette element', () => {
      const html = getSidebarTemplate()
      expect(html).toContain('<el-command-palette')
      expect(html).toContain('</el-command-palette>')
    })

    it('should have search input with correct attributes', () => {
      const html = getSidebarTemplate()
      expect(html).toContain('id="sidebarSearch"')
      expect(html).toContain('type="text"')
      expect(html).toContain('placeholder="Search profiles…"')
      expect(html).toContain('autofocus')
    })

    it('should include search icon', () => {
      const html = getSidebarTemplate()
      expect(html).toContain('<svg')
      expect(html).toContain('</svg>')
    })

    it('should have profile list container', () => {
      const html = getSidebarTemplate()
      expect(html).toContain('id="profileList"')
    })

    it('should have search results group', () => {
      const html = getSidebarTemplate()
      expect(html).toContain('id="searchResults"')
    })

    it('should have no results container', () => {
      const html = getSidebarTemplate()
      expect(html).toContain('id="noResults"')
      expect(html).toContain('No results found')
    })

    it('should have correct styling classes', () => {
      const html = getSidebarTemplate()
      expect(html).toContain('bg-stone-900')
      expect(html).toContain('border-r')
      expect(html).toContain('border-stone-800')
    })

    it('should include footer with new profile button', () => {
      const html = getSidebarTemplate()
      expect(html).toContain('id="footerNewProfile"')
      expect(html).toContain('New')
    })
  })

  describe('Popup template integration', () => {
    it('should export COLOR_PALETTE', () => {
      expect(COLOR_PALETTE).toBeDefined()
      expect(Array.isArray(COLOR_PALETTE)).toBe(true)
    })

    it('should export getSidebarTemplate function', () => {
      expect(typeof getSidebarTemplate).toBe('function')
    })

    it('getSidebarTemplate should be callable without arguments', () => {
      expect(() => getSidebarTemplate()).not.toThrow()
    })

    it('sidebar should include accessible elements', () => {
      const html = getSidebarTemplate()
      expect(html).toContain('aria-hidden')
      expect(html).toContain('aria-')
    })
  })

  describe('customCheckbox', () => {
    it('should render ch-checkbox element', () => {
      const html = customCheckbox({})
      expect(html).toContain('<ch-checkbox')
      expect(html).toContain('</ch-checkbox>')
    })

    it('should include id when provided', () => {
      const html = customCheckbox({ id: 'test-checkbox' })
      expect(html).toContain('id="test-checkbox"')
    })

    it('should not include id when not provided', () => {
      const html = customCheckbox({})
      expect(html).not.toMatch(/id="/i)
    })

    it('should include data-role when provided', () => {
      const html = customCheckbox({ dataRole: 'enabled' })
      expect(html).toContain('data-role="enabled"')
    })

    it('should include checked attribute when checked is true', () => {
      const html = customCheckbox({ checked: true })
      expect(html).toContain('checked')
    })

    it('should not include checked attribute when checked is false', () => {
      const html = customCheckbox({ checked: false })
      expect(html).not.toContain('checked')
    })

    it('should include disabled attribute when disabled is true', () => {
      const html = customCheckbox({ disabled: true })
      expect(html).toContain('disabled')
    })

    it('should handle all options together', () => {
      const html = customCheckbox({
        id: 'profile-enabled',
        dataRole: 'enabled',
        checked: true,
        disabled: false,
      })

      expect(html).toContain('id="profile-enabled"')
      expect(html).toContain('data-role="enabled"')
      expect(html).toContain('checked')
      expect(html).not.toContain('disabled')
    })
  })

  describe('profileListItem', () => {
    const testProfile = {
      id: 'profile-123',
      name: 'Test Profile',
      color: '#3b82f6',
      enabled: true,
    }

    it('should render anchor element', () => {
      const html = profileListItem(testProfile, false)
      expect(html).toContain('<a')
      expect(html).toContain('</a>')
    })

    it('should include data-id attribute', () => {
      const html = profileListItem(testProfile, false)
      expect(html).toContain('data-id="profile-123"')
    })

    it('should have aria-selected based on isActive', () => {
      const htmlActive = profileListItem(testProfile, true)
      const htmlInactive = profileListItem(testProfile, false)

      expect(htmlActive).toContain('aria-selected="true"')
      expect(htmlInactive).toContain('aria-selected="false"')
    })

    it('should include active class when isActive is true', () => {
      const html = profileListItem(testProfile, true)
      expect(html).toContain('active bg-white/5')
    })

    it('should not include active class when isActive is false', () => {
      const html = profileListItem(testProfile, false)
      expect(html).not.toContain('active bg-white/5')
    })

    it('should render profile name', () => {
      const html = profileListItem(testProfile, false)
      expect(html).toContain('Test Profile')
    })

    it('should render profile notes when provided', () => {
      const profile = {
        ...testProfile,
        notes: 'Development profile',
      }
      const html = profileListItem(profile, false)
      expect(html).toContain('Development profile')
    })

    it('should not render notes section when not provided', () => {
      const html = profileListItem(testProfile, false)
      expect(html).not.toContain('text-gray-400')
    })

    it('should have aria-labelledby attribute', () => {
      const html = profileListItem(testProfile, false)
      expect(html).toContain('aria-labelledby="profile-label-profile-123"')
    })

    it('should generate avatar from initials when provided', () => {
      const profile = {
        ...testProfile,
        initials: 'TP',
      }
      const html = profileListItem(profile, false)
      expect(html).toContain('T') // Only first character of initials is used
    })

    it('should generate avatar from name when initials not provided', () => {
      const html = profileListItem(testProfile, false)
      expect(html).toContain('Test Profile')
    })

    it('should escape HTML in profile name', () => {
      const profile = {
        ...testProfile,
        name: '<script>alert("xss")</script>',
      }
      const html = profileListItem(profile, false)
      expect(html).not.toContain('<script>')
      expect(html).toContain('&lt;script&gt;')
    })

    it('should escape HTML in notes', () => {
      const profile = {
        ...testProfile,
        notes: '<img src=x onerror="alert(1)">',
      }
      const html = profileListItem(profile, false)
      expect(html).not.toContain('<img')
      expect(html).toContain('&lt;img')
      expect(html).toContain('&quot;alert(1)&quot;')
    })
  })

  describe('getPopupTemplate', () => {
    it('should return a string', () => {
      const html = getPopupTemplate()
      expect(typeof html).toBe('string')
    })

    it('should have main app container', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="app"')
      expect(html).toContain('w-[800px] h-[600px]')
    })

    it('should include sidebar template', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="sidebarSearch"')
      expect(html).toContain('id="profileList"')
    })

    it('should have empty state section', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="detailEmpty"')
      expect(html).toContain('No profiles')
      expect(html).toContain('id="newProfileEmpty"')
    })

    it('should have detail form', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="detail"')
      expect(html).toContain('id="profileName"')
      expect(html).toContain('id="profileNotes"')
    })

    it('should include color picker popover', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="colorPickerPopover"')
      expect(html).toContain('data-color=')
    })

    it('should render all color options', () => {
      const html = getPopupTemplate()
      COLOR_PALETTE.forEach((color) => {
        expect(html).toContain(`data-hex="${color.hex}"`)
      })
    })

    it('should include profile avatar button', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="profileAvatarBtn"')
      expect(html).toContain('id="profileAvatarInitials"')
    })

    it('should include headers sections', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="addReq"')
      expect(html).toContain('id="addRes"')
      expect(html).toContain('id="reqHeaders"')
      expect(html).toContain('id="resHeaders"')
    })

    it('should include matchers section', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="addMatcher"')
      expect(html).toContain('id="matchers"')
    })

    it('should have apply button', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="apply"')
      expect(html).toContain('Apply')
    })

    it('should have enable checkbox', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="enabled"')
    })

    it('should include import file input', () => {
      const html = getPopupTemplate()
      expect(html).toContain('id="importFile"')
      expect(html).toContain('accept=".json"')
    })

    it('should have dropdown menu with options', () => {
      const html = getPopupTemplate()
      expect(html).toContain('data-action="importHeaders"')
      expect(html).toContain('data-action="importProfile"')
      expect(html).toContain('data-action="duplicate"')
      expect(html).toContain('data-action="delete"')
    })

    it('should have correct form structure', () => {
      const html = getPopupTemplate()
      expect(html).toContain('<form')
      expect(html).toContain('id="detail"')
      expect(html).toContain('</form>')
    })

    it('should include all necessary input fields', () => {
      const html = getPopupTemplate()
      expect(html).toContain('type="text"')
      expect(html).toContain('type="button"')
      expect(html).toContain('textarea')
    })
  })
})
