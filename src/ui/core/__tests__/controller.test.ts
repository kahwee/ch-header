/**
 * Tests for PopupController refactoring
 * Tests guard utilities, deep cloning, and validation consolidation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PopupController } from '../controller'
import { Profile, State } from '../../../lib/types'

describe('PopupController - Refactored Methods', () => {
  let state: State
  let controller: PopupController
  let callbacks: ReturnType<typeof createMockCallbacks>

  function createMockCallbacks() {
    return {
      renderList: vi.fn(),
      renderHeaders: vi.fn(),
      renderMatchers: vi.fn(),
      select: vi.fn((id: string | null) => {
        // Mock the select callback to actually update state.current
        state.current = id ? state.profiles.find((p) => p.id === id) || null : null
      }),
      saveProfiles: vi.fn(),
      syncAndRender: vi.fn(),
    }
  }

  function createTestProfile(): Profile {
    return {
      id: 'test-1',
      name: 'Test Profile',
      color: 'blue-700',
      enabled: false,
      notes: 'Test notes',
      matchers: [{ id: 'matcher-1', urlFilter: 'localhost:3000', resourceTypes: [] }],
      requestHeaders: [
        { id: 'req-1', header: 'X-Custom', value: 'test' },
        { id: 'req-2', header: 'Authorization', value: 'Bearer token' },
      ],
      responseHeaders: [],
    }
  }

  beforeEach(() => {
    // Mock chrome API
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          set: vi.fn(),
        },
      },
      runtime: {
        lastError: null,
        sendMessage: vi.fn(),
      },
    })

    callbacks = createMockCallbacks()
    state = {
      profiles: [createTestProfile()],
      filtered: [createTestProfile()],
      current: createTestProfile(),
      activeId: 'test-1',
    }
    controller = new PopupController(state, callbacks)
  })

  describe('Guard Utility (withCurrentProfile)', () => {
    it('should not call callback if current profile is null', () => {
      state.current = null

      // Try to call a method that uses the guard
      controller.onAddHeader(true)

      // Callbacks should not be called
      expect(callbacks.syncAndRender).not.toHaveBeenCalled()
    })

    it('should call callback if current profile exists', () => {
      state.current = createTestProfile()

      controller.onAddHeader(true)

      expect(callbacks.syncAndRender).toHaveBeenCalledOnce()
    })

    it('should preserve state changes in callback', () => {
      state.current = createTestProfile()
      const initialLength = state.current.requestHeaders.length

      controller.onAddHeader(true)

      expect(state.current!.requestHeaders.length).toBe(initialLength + 1)
      expect(state.current!.requestHeaders[initialLength].header).toBe('')
    })
  })

  describe('Deep Clone Utility (deepCloneProfile)', () => {
    it('should create a new profile with new IDs', () => {
      const original = createTestProfile()
      state.current = original

      controller.onDuplicateProfile()

      expect(state.profiles.length).toBe(2)
      const clone = state.profiles[0]

      // New ID
      expect(clone.id).not.toBe(original.id)

      // Copied fields
      expect(clone.name).toBe(`${original.name} (copy)`)
      expect(clone.color).toBe(original.color)
      expect(clone.notes).toBe(original.notes)

      // Should be disabled
      expect(clone.enabled).toBe(false)

      // New matcher IDs
      expect(clone.matchers.length).toBe(original.matchers.length)
      clone.matchers.forEach((m, i) => {
        expect(m.id).not.toBe(original.matchers[i].id)
        expect(m.urlFilter).toBe(original.matchers[i].urlFilter)
      })

      // New header IDs
      expect(clone.requestHeaders.length).toBe(original.requestHeaders.length)
      clone.requestHeaders.forEach((h, i) => {
        expect(h.id).not.toBe(original.requestHeaders[i].id)
        expect(h.header).toBe(original.requestHeaders[i].header)
        expect(h.value).toBe(original.requestHeaders[i].value)
      })
    })
  })

  describe('Validation Consolidation', () => {
    it('should validate matchers correctly', () => {
      const data = [
        { urlFilter: 'example.com', resourceTypes: ['script'] },
        { urlFilter: 'api.example.com' }, // Missing resourceTypes
        null, // Invalid
        'string', // Invalid
      ]

      controller.onImportProfile({
        name: 'Test Import',
        matchers: data,
        requestHeaders: [],
        responseHeaders: [],
      })

      expect(state.profiles.length).toBe(2)
      const imported = state.profiles[0]

      // Should have 2 valid matchers (null and string filtered)
      expect(imported.matchers.length).toBe(2)

      // First matcher should have its values
      expect(imported.matchers[0].urlFilter).toBe('example.com')
      expect(imported.matchers[0].resourceTypes).toEqual(['script'])

      // Second matcher should have defaults
      expect(imported.matchers[1].urlFilter).toBe('api.example.com')
      expect(imported.matchers[1].resourceTypes).toEqual([])

      // All should have IDs
      imported.matchers.forEach((m) => {
        expect(m.id).toBeDefined()
        expect(m.id).toMatch(/^[0-9a-f-]+$/)
      })
    })

    it('should validate headers correctly', () => {
      const data = [
        { header: 'X-Custom', value: 'test', enabled: true },
        { header: 'X-Another', value: 'value' }, // Missing enabled
        null, // Invalid
      ]

      controller.onImportHeaders(data)

      expect(callbacks.syncAndRender).toHaveBeenCalled()
      expect(state.current!.requestHeaders.length).toBe(4) // 2 original + 2 new

      const imported = state.current!.requestHeaders.slice(2)

      // First header should have its values
      expect(imported[0].header).toBe('X-Custom')
      expect(imported[0].value).toBe('test')
      expect(imported[0].enabled).toBe(true)

      // Second header should use defaults
      expect(imported[1].header).toBe('X-Another')
      expect(imported[1].value).toBe('value')
      expect(imported[1].enabled).toBe(true) // Default

      // All should have IDs
      imported.forEach((h) => {
        expect(h.id).toBeDefined()
        expect(h.id).toMatch(/^[0-9a-f-]+$/)
      })
    })

    it('should handle empty arrays gracefully', () => {
      controller.onImportProfile({
        name: 'Empty Import',
        matchers: undefined, // Undefined should become []
        requestHeaders: null, // Null should become []
        responseHeaders: [],
      })

      expect(state.profiles.length).toBe(2)
      const imported = state.profiles[0]

      expect(imported.matchers).toEqual([])
      expect(imported.requestHeaders).toEqual([])
      expect(imported.responseHeaders).toEqual([])
    })
  })

  describe('Header Array Helper', () => {
    it('should handle request header operations', () => {
      state.current = createTestProfile()
      const initialReqCount = state.current.requestHeaders.length

      controller.onAddHeader(true)

      expect(state.current.requestHeaders.length).toBe(initialReqCount + 1)
    })

    it('should handle response header operations', () => {
      state.current = createTestProfile()
      const initialResCount = state.current.responseHeaders.length

      controller.onAddHeader(false)

      expect(state.current.responseHeaders.length).toBe(initialResCount + 1)
    })

    it('should sort headers correctly', () => {
      state.current = createTestProfile()
      state.current.requestHeaders = [
        { id: '1', header: 'Z-Header', value: 'z' },
        { id: '2', header: 'A-Header', value: 'a' },
        { id: '3', header: 'M-Header', value: 'm' },
      ]

      controller.onSortHeaders(true)

      expect(state.current.requestHeaders.map((h) => h.header)).toEqual([
        'A-Header',
        'M-Header',
        'Z-Header',
      ])
    })

    it('should clear headers correctly', () => {
      state.current = createTestProfile()
      expect(state.current.requestHeaders.length).toBeGreaterThan(0)

      controller.onClearHeaders(true)

      expect(state.current.requestHeaders.length).toBe(0)
    })
  })

  describe('Matcher Operations', () => {
    it('should add matchers with default values', () => {
      state.current = createTestProfile()
      const initialCount = state.current.matchers.length

      controller.onAddMatcher()

      expect(state.current.matchers.length).toBe(initialCount + 1)
      const newMatcher = state.current.matchers[initialCount]
      expect(newMatcher.urlFilter).toBe('*')
      expect(newMatcher.resourceTypes).toEqual([])
    })

    it('should remove matchers by ID', () => {
      state.current = createTestProfile()
      const matcherId = state.current.matchers[0].id
      const initialCount = state.current.matchers.length

      controller.onRemoveMatcher(matcherId)

      expect(state.current.matchers.length).toBe(initialCount - 1)
      expect(state.current.matchers.some((m) => m.id === matcherId)).toBe(false)
    })

    it('should change matcher URL filter', () => {
      state.current = createTestProfile()
      const matcherId = state.current.matchers[0].id

      controller.onMatcherChange(matcherId, 'urlFilter', 'localhost:8000')

      const matcher = state.current.matchers.find((m) => m.id === matcherId)
      expect(matcher!.urlFilter).toBe('localhost:8000')
    })

    it('should use wildcard as default for empty URL filter', () => {
      state.current = createTestProfile()
      const matcherId = state.current.matchers[0].id

      controller.onMatcherChange(matcherId, 'urlFilter', '')

      const matcher = state.current.matchers.find((m) => m.id === matcherId)
      expect(matcher!.urlFilter).toBe('*')
    })

    it('should change matcher resource types', () => {
      state.current = createTestProfile()
      const matcherId = state.current.matchers[0].id

      controller.onMatcherChange(matcherId, 'types', 'script')

      const matcher = state.current.matchers.find((m) => m.id === matcherId)
      expect(matcher!.resourceTypes).toEqual(['script'])
    })
  })

  describe('Profile Selection', () => {
    it('should select profile by ID', () => {
      const profileId = state.profiles[0].id

      controller.onProfileItemClick(profileId)

      expect(state.current?.id).toBe(profileId)
      expect(callbacks.select).toHaveBeenCalledWith(profileId)
    })

    it('should not crash on invalid profile ID', () => {
      controller.onProfileItemClick('non-existent-id')

      expect(callbacks.select).toHaveBeenCalledWith('non-existent-id')
    })
  })

  describe('Profile Creation', () => {
    it('should create new profile with defaults', () => {
      const initialCount = state.profiles.length

      controller.onNewProfile()

      expect(state.profiles.length).toBe(initialCount + 1)
      const newProfile = state.profiles[0] // New profiles are unshifted (added at beginning)
      expect(newProfile.name).toBe('New profile') // Controller creates with lowercase 'p'
      expect(newProfile.matchers[0]).toBeDefined() // Should have at least one default matcher
      expect(newProfile.matchers[0].urlFilter).toBe('*')
      expect(newProfile.requestHeaders).toEqual([])
      expect(newProfile.responseHeaders).toEqual([])
      expect(newProfile.enabled).toBe(false)
    })

    it('should select newly created profile', () => {
      controller.onNewProfile()

      expect(state.current).toBeTruthy()
      expect(callbacks.select).toHaveBeenCalled()
    })
  })

  describe('Profile Deletion', () => {
    it('should delete current profile', () => {
      const profileId = state.current!.id
      const initialCount = state.profiles.length

      controller.onDeleteProfile()

      expect(state.profiles.length).toBe(initialCount - 1)
      expect(state.profiles.some((p) => p.id === profileId)).toBe(false)
    })

    it('should not delete when no profile selected', () => {
      state.current = null
      const initialCount = state.profiles.length

      controller.onDeleteProfile()

      expect(state.profiles.length).toBe(initialCount)
    })

    it('should clear current after deletion', () => {
      controller.onDeleteProfile()

      expect(state.current).toBeNull()
    })
  })

  describe('Profile Field Changes', () => {
    beforeEach(() => {
      state.current = createTestProfile()
    })

    it('should change profile name', () => {
      controller.onProfileNameChange('New Name')

      expect(state.current!.name).toBe('New Name')
      expect(callbacks.syncAndRender).toHaveBeenCalled()
    })

    it('should change profile color', () => {
      controller.onProfileColorChange('red-700')

      expect(state.current!.color).toBe('red-700')
      expect(callbacks.syncAndRender).toHaveBeenCalled()
    })

    it('should change profile notes', () => {
      controller.onProfileNotesChange('Updated notes')

      expect(state.current!.notes).toBe('Updated notes')
      expect(callbacks.syncAndRender).toHaveBeenCalled()
    })

    it('should toggle profile enabled state', () => {
      const initialState = state.current!.enabled

      controller.onProfileEnabledChange(!initialState)

      expect(state.current!.enabled).toBe(!initialState)
      // onProfileEnabledChange calls setActiveProfile, not syncAndRender
      // Verify the profile is set as active
      expect(state.activeId).toBe(state.current!.id)
    })
  })

  describe('Header Changes', () => {
    beforeEach(() => {
      state.current = createTestProfile()
    })

    it('should change header name', () => {
      const headerId = state.current!.requestHeaders[0].id

      controller.onHeaderChange(headerId, true, 'header', 'X-New-Header')

      const header = state.current!.requestHeaders.find((h) => h.id === headerId)
      expect(header!.header).toBe('X-New-Header')
    })

    it('should change header value', () => {
      const headerId = state.current!.requestHeaders[0].id

      controller.onHeaderChange(headerId, true, 'value', 'new-value')

      const header = state.current!.requestHeaders.find((h) => h.id === headerId)
      expect(header!.value).toBe('new-value')
    })

    it('should toggle header enabled state', () => {
      const headerId = state.current!.requestHeaders[0].id
      const header = state.current!.requestHeaders.find((h) => h.id === headerId)
      const initialEnabled = header?.enabled ?? true

      controller.onHeaderChange(headerId, true, 'enabled', !initialEnabled)

      const updated = state.current!.requestHeaders.find((h) => h.id === headerId)
      expect(updated!.enabled).toBe(!initialEnabled)
    })

    it('should remove header', () => {
      const headerId = state.current!.requestHeaders[0].id
      const initialCount = state.current!.requestHeaders.length

      controller.onRemoveHeader(headerId, true)

      expect(state.current!.requestHeaders.length).toBe(initialCount - 1)
      expect(state.current!.requestHeaders.some((h) => h.id === headerId)).toBe(false)
    })

    it('should handle response header changes', () => {
      state.current!.responseHeaders = [{ id: 'res-1', header: 'X-Response', value: 'test' }]

      controller.onHeaderChange('res-1', false, 'value', 'updated')

      const header = state.current!.responseHeaders.find((h) => h.id === 'res-1')
      expect(header!.value).toBe('updated')
    })
  })

  describe('Search and Filter', () => {
    beforeEach(() => {
      state.profiles = [
        {
          ...createTestProfile(),
          id: 'profile-1',
          name: 'Production API',
          notes: 'AWS credentials',
        },
        {
          ...createTestProfile(),
          id: 'profile-2',
          name: 'Development Server',
          notes: 'Local debug mode',
        },
        {
          ...createTestProfile(),
          id: 'profile-3',
          name: 'Testing Sandbox',
          notes: 'QA environment',
        },
      ]
      state.filtered = [...state.profiles]
    })

    it('should filter profiles by search query', () => {
      controller.onSearchChange('prod')

      expect(state.filtered.length).toBe(1)
      expect(state.filtered[0].name).toContain('Production')
    })

    it('should be case insensitive', () => {
      controller.onSearchChange('DEVEL')

      expect(state.filtered.length).toBe(1)
      expect(state.filtered[0].name).toContain('Development')
    })

    it('should clear filter on empty search', () => {
      controller.onSearchChange('AWS')
      expect(state.filtered.length).toBeLessThan(state.profiles.length)

      controller.onSearchChange('')

      expect(state.filtered.length).toBe(state.profiles.length)
    })

    it('should call renderList on search', () => {
      controller.onSearchChange('dev')

      expect(callbacks.renderList).toHaveBeenCalled()
    })
  })

  describe('Import Operations', () => {
    beforeEach(() => {
      state.current = createTestProfile()
    })

    it('should import headers from JSON', () => {
      const initialCount = state.current!.requestHeaders.length
      const importData = [{ header: 'X-Imported', value: 'imported-value' }]

      controller.onImportHeaders(importData)

      expect(state.current!.requestHeaders.length).toBeGreaterThan(initialCount)
      const imported = state.current!.requestHeaders.find((h) => h.header === 'X-Imported')
      expect(imported?.value).toBe('imported-value')
    })

    it('should handle import with invalid data', () => {
      const initialCount = state.current!.requestHeaders.length

      controller.onImportHeaders({ invalid: 'data' })

      expect(state.current!.requestHeaders.length).toBe(initialCount)
    })

    it('should import full profile from JSON', () => {
      const importData = {
        name: 'Imported Profile',
        color: 'green-700',
        matchers: [{ urlFilter: 'example.com' }],
        requestHeaders: [{ header: 'X-Test', value: 'test' }],
      }

      controller.onImportProfile(importData)

      expect(state.current!.name).toBe('Imported Profile')
      expect(state.current!.color).toBe('green-700')
      expect(state.current!.matchers.length).toBeGreaterThan(0)
      expect(state.current!.requestHeaders.length).toBeGreaterThan(0)
    })

    it('should handle import with invalid profile data', () => {
      const initialProfileCount = state.profiles.length

      controller.onImportProfile({ invalid: 'profile' })

      // Invalid data still creates a new profile with default name and empty arrays
      expect(state.profiles.length).toBe(initialProfileCount + 1)
      const importedProfile = state.profiles[0]
      expect(importedProfile.name).toBe('Imported profile') // Default name for invalid data
      expect(importedProfile.matchers).toEqual([])
      expect(importedProfile.requestHeaders).toEqual([])
      expect(importedProfile.responseHeaders).toEqual([])
    })
  })
})
