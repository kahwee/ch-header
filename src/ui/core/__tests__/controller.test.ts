import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Profile, State } from '../../../lib/types'
import { PopupController } from '../controller'

describe('PopupController', () => {
  let state: State
  let controller: PopupController
  let callbacks: ReturnType<typeof createMockCallbacks>

  function createMockCallbacks() {
    return {
      commit: vi.fn(),
      renderList: vi.fn(),
      select: vi.fn((id: string | null) => {
        // Mock the select callback to actually update state.current
        state.current = id ? state.profiles.find((p) => p.id === id) || null : null
      }),
    }
  }

  function createTestProfile(): Profile {
    return {
      id: 'test-1',
      name: 'Test Profile',
      color: 'blue',
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
      expect(callbacks.commit).not.toHaveBeenCalled()
    })

    it('should call callback if current profile exists', () => {
      state.current = createTestProfile()

      controller.onAddHeader(true)

      expect(callbacks.commit).toHaveBeenCalledOnce()
    })

    it('should preserve state changes in callback', () => {
      state.current = createTestProfile()
      const initialLength = state.current.requestHeaders.length

      controller.onAddHeader(true)

      expect(state.current?.requestHeaders.length).toBe(initialLength + 1)
      expect(state.current?.requestHeaders[initialLength].header).toBe('')
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
      expect(newMatcher.urlFilter).toBe('||example.invalid^')
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
      expect(matcher?.urlFilter).toBe('localhost:8000')
    })

    it('should use wildcard as default for empty URL filter', () => {
      state.current = createTestProfile()
      const matcherId = state.current.matchers[0].id

      controller.onMatcherChange(matcherId, 'urlFilter', '')

      const matcher = state.current.matchers.find((m) => m.id === matcherId)
      expect(matcher?.urlFilter).toBe('*')
    })

    it('should change matcher resource types', () => {
      state.current = createTestProfile()
      const matcherId = state.current.matchers[0].id

      controller.onMatcherChange(matcherId, 'types', 'script')

      const matcher = state.current.matchers.find((m) => m.id === matcherId)
      expect(matcher?.resourceTypes).toEqual(['script'])
    })

    it('should sort and clear matchers', () => {
      state.current = createTestProfile()
      state.current.matchers.push({
        id: 'matcher-2',
        urlFilter: 'alpha.example',
        resourceTypes: [],
      })

      controller.onSortMatchers()
      expect(state.current.matchers.map((matcher) => matcher.urlFilter)).toEqual([
        'alpha.example',
        'localhost:3000',
      ])

      controller.onClearMatchers()
      expect(state.current.matchers).toEqual([])
      expect(callbacks.commit).toHaveBeenCalledTimes(2)
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
      expect(newProfile.matchers[0].urlFilter).toBe('||example.invalid^')
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
      const profileId = state.current?.id
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

      expect(state.current?.name).toBe('New Name')
      expect(callbacks.commit).toHaveBeenCalled()
    })

    it('should change profile color', () => {
      controller.onProfileColorChange('red')

      expect(state.current!.color).toBe('red')
      expect(callbacks.commit).toHaveBeenCalled()
    })

    it('should change profile notes', () => {
      controller.onProfileNotesChange('Updated notes')

      expect(state.current?.notes).toBe('Updated notes')
      expect(callbacks.commit).toHaveBeenCalled()
    })
  })

  describe('Header Changes', () => {
    beforeEach(() => {
      state.current = createTestProfile()
    })

    it('should change header name', () => {
      const headerId = state.current!.requestHeaders[0].id

      controller.onHeaderChange(headerId, true, 'header', 'X-New-Header')

      const header = state.current?.requestHeaders.find((h) => h.id === headerId)
      expect(header?.header).toBe('X-New-Header')
    })

    it('should change header value', () => {
      const headerId = state.current!.requestHeaders[0].id

      controller.onHeaderChange(headerId, true, 'value', 'new-value')

      const header = state.current?.requestHeaders.find((h) => h.id === headerId)
      expect(header?.value).toBe('new-value')
    })

    it('should toggle header enabled state', () => {
      const headerId = state.current!.requestHeaders[0].id
      const header = state.current?.requestHeaders.find((h) => h.id === headerId)
      const initialEnabled = header?.enabled ?? true

      controller.onHeaderChange(headerId, true, 'enabled', !initialEnabled)

      const updated = state.current?.requestHeaders.find((h) => h.id === headerId)
      expect(updated?.enabled).toBe(!initialEnabled)
    })

    it('should remove header', () => {
      const headerId = state.current!.requestHeaders[0].id
      const initialCount = state.current!.requestHeaders.length

      controller.onRemoveHeader(headerId, true)

      expect(state.current?.requestHeaders.length).toBe(initialCount - 1)
      expect(state.current?.requestHeaders.some((h) => h.id === headerId)).toBe(false)
    })

    it('should handle response header changes', () => {
      state.current!.responseHeaders = [{ id: 'res-1', header: 'X-Response', value: 'test' }]

      controller.onHeaderChange('res-1', false, 'value', 'updated')

      const header = state.current?.responseHeaders.find((h) => h.id === 'res-1')
      expect(header?.value).toBe('updated')
    })

    it('should append prevalidated imported headers', () => {
      const imported = { id: 'imported', header: 'X-Imported', value: 'yes', enabled: true }

      controller.onImportHeaders([imported])

      expect(state.current?.requestHeaders[state.current.requestHeaders.length - 1]).toEqual(
        imported
      )
      expect(callbacks.commit).toHaveBeenCalledOnce()
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
})
