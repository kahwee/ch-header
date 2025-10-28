import { describe, it, expect } from 'vitest'
import { STORAGE_KEYS } from '../types'
import type { Profile, Matcher, HeaderOp } from '../types'

describe('Types', () => {
  describe('STORAGE_KEYS', () => {
    it('should have correct storage key constants', () => {
      expect(STORAGE_KEYS.PROFILES).toBe('profiles')
      expect(STORAGE_KEYS.ACTIVE_PROFILE_ID).toBe('activeProfileId')
    })
  })

  describe('Type definitions', () => {
    it('should allow creating a valid Profile', () => {
      const profile: Profile = {
        id: 'test-id',
        name: 'Test Profile',
        color: '#ff0000',
        notes: 'Test notes',
        enabled: true,
        matchers: [],
        requestHeaders: [],
        responseHeaders: [],
      }

      expect(profile.id).toBe('test-id')
      expect(profile.name).toBe('Test Profile')
      expect(profile.enabled).toBe(true)
    })

    it('should allow creating a valid Matcher', () => {
      const matcher: Matcher = {
        id: 'match-1',
        urlFilter: 'example.com',
        resourceTypes: ['main_frame', 'xmlhttprequest'],
      }

      expect(matcher.id).toBe('match-1')
      expect(matcher.urlFilter).toBe('example.com')
      expect(matcher.resourceTypes).toHaveLength(2)
    })

    it('should allow creating a valid HeaderOp', () => {
      const header: HeaderOp = {
        id: 'header-1',
        header: 'X-Custom-Header',
        value: 'custom-value',
      }

      expect(header.header).toBe('X-Custom-Header')
      expect(header.value).toBe('custom-value')
    })

    it('should support header operations (upsert)', () => {
      const header: HeaderOp = {
        id: 'header-1',
        header: 'X-Custom',
        value: 'value-1',
        enabled: true,
      }

      expect(header.enabled).toBe(true)
      expect(header.value).toBe('value-1')
    })

    it('should support disabling headers', () => {
      const header: HeaderOp = {
        id: 'header-1',
        header: 'X-Disabled',
        value: 'value',
        enabled: false,
      }

      expect(header.enabled).toBe(false)
    })
  })
})
