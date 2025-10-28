import { describe, it, expect } from 'vitest'
import { hashToInt, buildRulesFromProfile } from '../dnr-rules'
import type { Profile } from '../types'

describe('DNR Rules', () => {
  describe('hashToInt', () => {
    it('should generate positive integer IDs', () => {
      const id = hashToInt('test-profile')
      expect(id).toBeGreaterThan(0)
      expect(Number.isInteger(id)).toBe(true)
    })

    it('should be deterministic', () => {
      const id1 = hashToInt('same-input')
      const id2 = hashToInt('same-input')
      expect(id1).toBe(id2)
    })

    it('should generate different IDs for different inputs', () => {
      const id1 = hashToInt('input-one')
      const id2 = hashToInt('input-two')
      expect(id1).not.toBe(id2)
    })

    it('should be within valid DNR rule ID range', () => {
      const id = hashToInt('test-id')
      expect(id).toBeGreaterThanOrEqual(1)
      expect(id).toBeLessThanOrEqual(2147483647)
    })
  })

  describe('buildRulesFromProfile', () => {
    it('should return empty array for null profile', () => {
      const rules = buildRulesFromProfile(null)
      expect(rules).toEqual([])
    })

    it('should build rules from request headers', () => {
      const profile: Profile = {
        id: 'test-profile',
        name: 'Test Profile',
        color: '#ff0000',
        enabled: true,
        matchers: [{ id: 'match-1', urlFilter: 'example.com' }],
        requestHeaders: [{ id: 'header-1', header: 'X-Custom', value: 'test-value' }],
        responseHeaders: [],
      }

      const rules = buildRulesFromProfile(profile)

      expect(rules).toHaveLength(1)
      expect(rules[0].action.type).toBe('modifyHeaders')
      expect(rules[0].action.requestHeaders).toHaveLength(1)
      expect(rules[0].action.requestHeaders![0].header).toBe('X-Custom')
      expect(rules[0].action.requestHeaders![0].operation).toBe('set')
      expect(rules[0].action.requestHeaders![0].value).toBe('test-value')
    })

    it('should build rules from response headers', () => {
      const profile: Profile = {
        id: 'test-profile',
        name: 'Test Profile',
        color: '#ff0000',
        enabled: true,
        matchers: [{ id: 'match-1', urlFilter: 'api.example.com' }],
        requestHeaders: [],
        responseHeaders: [{ id: 'header-1', header: 'X-Response', value: 'custom-value' }],
      }

      const rules = buildRulesFromProfile(profile)

      expect(rules).toHaveLength(1)
      expect(rules[0].action.responseHeaders).toHaveLength(1)
      expect(rules[0].action.responseHeaders![0].header).toBe('X-Response')
      expect(rules[0].action.responseHeaders![0].operation).toBe('set')
      expect(rules[0].action.responseHeaders![0].value).toBe('custom-value')
    })

    it('should use set operation for all headers (upsert pattern)', () => {
      const profile: Profile = {
        id: 'test-profile',
        name: 'Test Profile',
        color: '#ff0000',
        enabled: true,
        matchers: [{ id: 'match-1', urlFilter: '*' }],
        requestHeaders: [{ id: 'header-1', header: 'X-Custom', value: 'test-value' }],
        responseHeaders: [],
      }

      const rules = buildRulesFromProfile(profile)

      expect(rules).toHaveLength(1)
      expect(rules[0].action.requestHeaders![0].operation).toBe('set')
      expect(rules[0].action.requestHeaders![0].value).toBe('test-value')
    })

    it('should skip rules with no header operations', () => {
      const profile: Profile = {
        id: 'test-profile',
        name: 'Test Profile',
        color: '#ff0000',
        enabled: true,
        matchers: [{ id: 'match-1', urlFilter: 'example.com' }],
        requestHeaders: [],
        responseHeaders: [],
      }

      const rules = buildRulesFromProfile(profile)

      expect(rules).toHaveLength(0)
    })

    it('should use default matchers when empty', () => {
      const profile: Profile = {
        id: 'test-profile',
        name: 'Test Profile',
        color: '#ff0000',
        enabled: true,
        matchers: [],
        requestHeaders: [{ id: 'header-1', header: 'X-Test', value: 'value' }],
        responseHeaders: [],
      }

      const rules = buildRulesFromProfile(profile)

      expect(rules).toHaveLength(1)
      expect(rules[0].condition.urlFilter).toBe('*')
    })

    it('should generate unique rule IDs based on profile and matcher', () => {
      const profile: Profile = {
        id: 'profile-1',
        name: 'Test Profile',
        color: '#ff0000',
        enabled: true,
        matchers: [
          { id: 'match-1', urlFilter: 'example.com' },
          { id: 'match-2', urlFilter: 'api.example.com' },
        ],
        requestHeaders: [{ id: 'header-1', header: 'X-Test', value: 'value' }],
        responseHeaders: [],
      }

      const rules = buildRulesFromProfile(profile)

      expect(rules).toHaveLength(2)
      expect(rules[0].id).not.toBe(rules[1].id)
    })

    it('should set correct URL filters from matchers', () => {
      const profile: Profile = {
        id: 'test-profile',
        name: 'Test Profile',
        color: '#ff0000',
        enabled: true,
        matchers: [
          { id: 'match-1', urlFilter: 'example.com' },
          { id: 'match-2', urlFilter: '*api.example.com*' },
        ],
        requestHeaders: [{ id: 'header-1', header: 'X-Test', value: 'value' }],
        responseHeaders: [],
      }

      const rules = buildRulesFromProfile(profile)

      expect(rules[0].condition.urlFilter).toBe('example.com')
      expect(rules[1].condition.urlFilter).toBe('*api.example.com*')
    })
  })
})
