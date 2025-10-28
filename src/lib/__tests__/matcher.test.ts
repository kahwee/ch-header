import { describe, it, expect } from 'vitest'
import {
  detectFormat,
  matchUrl,
  validatePattern,
  generateExamples,
  getFormatName,
  getFormatHelp,
} from '../matcher'

describe('matcher utility', () => {
  describe('detectFormat', () => {
    it('detects simple format', () => {
      expect(detectFormat('localhost:3002')).toBe('simple')
      expect(detectFormat('example.com')).toBe('simple')
      expect(detectFormat('api.example.com')).toBe('simple')
    })

    it('detects wildcard format', () => {
      expect(detectFormat('localhost:3002/*')).toBe('wildcard')
      expect(detectFormat('*.example.com')).toBe('wildcard')
      expect(detectFormat('*.api.example.com')).toBe('wildcard')
      expect(detectFormat('example.com/api/*')).toBe('wildcard')
    })

    it('detects regex format', () => {
      expect(detectFormat('regex:localhost:30(0[0-9])')).toBe('regex')
      expect(detectFormat('regex:.*example\\.com')).toBe('regex')
    })

    it('defaults to simple for empty pattern', () => {
      expect(detectFormat('')).toBe('simple')
    })
  })

  describe('validatePattern', () => {
    it('validates simple patterns', () => {
      expect(validatePattern('localhost:3002').valid).toBe(true)
      expect(validatePattern('example.com').valid).toBe(true)
      expect(validatePattern('api.example.com').valid).toBe(true)
    })

    it('validates wildcard patterns', () => {
      expect(validatePattern('*.example.com').valid).toBe(true)
      expect(validatePattern('localhost:3002/*').valid).toBe(true)
      expect(validatePattern('example.com/api/*').valid).toBe(true)
    })

    it('validates regex patterns', () => {
      expect(validatePattern('regex:localhost:30(0[0-9])').valid).toBe(true)
      expect(validatePattern('regex:.*example\\.com').valid).toBe(true)
    })

    it('rejects invalid regex patterns', () => {
      const result = validatePattern('regex:[invalid')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid regex')
    })

    it('rejects empty pattern', () => {
      const result = validatePattern('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Pattern cannot be empty')
    })

    it('rejects patterns with invalid characters in non-regex mode', () => {
      const result = validatePattern('example.com[test]')
      expect(result.valid).toBe(false)
    })
  })

  describe('matchUrl - Simple patterns', () => {
    it('matches exact domain', () => {
      expect(matchUrl('localhost:3002', 'localhost:3002').matches).toBe(true)
    })

    it('matches domain with path', () => {
      expect(matchUrl('localhost:3002', 'localhost:3002/api/users').matches).toBe(true)
    })

    it('matches when pattern is substring', () => {
      expect(matchUrl('example.com', 'api.example.com').matches).toBe(true)
    })

    it('does not match different domain', () => {
      expect(matchUrl('localhost:3002', 'localhost:3001').matches).toBe(false)
      expect(matchUrl('example.com', 'other.com').matches).toBe(false)
    })

    it('is case insensitive', () => {
      expect(matchUrl('LOCALHOST:3002', 'localhost:3002').matches).toBe(true)
      expect(matchUrl('localhost:3002', 'LOCALHOST:3002').matches).toBe(true)
    })
  })

  describe('matchUrl - Wildcard patterns', () => {
    it('matches with * wildcard', () => {
      expect(matchUrl('localhost:3002/*', 'localhost:3002/api').matches).toBe(true)
      expect(matchUrl('localhost:3002/*', 'localhost:3002/api/users').matches).toBe(true)
    })

    it('matches subdomain wildcard', () => {
      expect(matchUrl('*.api.example.com', 'staging.api.example.com').matches).toBe(true)
      expect(matchUrl('*.api.example.com', 'prod.api.example.com').matches).toBe(true)
    })

    it('matches multiple wildcards', () => {
      expect(matchUrl('localhost:*/api/*', 'localhost:3002/api/users').matches).toBe(true)
      expect(matchUrl('localhost:*/api/*', 'localhost:8000/api/data').matches).toBe(true)
    })

    it('does not match when pattern requires specific path', () => {
      expect(matchUrl('localhost:3002/api/*', 'localhost:3002/admin/settings').matches).toBe(false)
    })

    it('handles wildcard at start', () => {
      expect(matchUrl('*.example.com', 'test.example.com').matches).toBe(true)
      expect(matchUrl('*.example.com', 'api.staging.example.com').matches).toBe(true)
    })
  })

  describe('matchUrl - Regex patterns', () => {
    it('matches with basic regex', () => {
      expect(matchUrl('regex:localhost:30.*', 'localhost:3000').matches).toBe(true)
      expect(matchUrl('regex:localhost:30.*', 'localhost:3002').matches).toBe(true)
    })

    it('matches port range with regex', () => {
      expect(matchUrl('regex:localhost:30(0[0-9])', 'localhost:3000').matches).toBe(true)
      expect(matchUrl('regex:localhost:30(0[0-9])', 'localhost:3009').matches).toBe(true)
      expect(matchUrl('regex:localhost:30(0[0-9])', 'localhost:3010').matches).toBe(false)
    })

    it('matches alternative paths with regex', () => {
      expect(matchUrl('regex:(api|admin)\\.example\\.com', 'api.example.com').matches).toBe(true)
      expect(matchUrl('regex:(api|admin)\\.example\\.com', 'admin.example.com').matches).toBe(true)
      expect(matchUrl('regex:(api|admin)\\.example\\.com', 'web.example.com').matches).toBe(false)
    })

    it('matches with escaped characters', () => {
      expect(matchUrl('regex:example\\.com', 'example.com').matches).toBe(true)
      expect(matchUrl('regex:example\\.com', 'exampleXcom').matches).toBe(false)
    })

    it('is case insensitive for regex', () => {
      expect(matchUrl('regex:LOCALHOST:3002', 'localhost:3002').matches).toBe(true)
    })
  })

  describe('generateExamples', () => {
    it('generates examples for simple pattern', () => {
      const examples = generateExamples('localhost:3002')
      expect(examples.length).toBeGreaterThan(0)
      expect(examples[0]).toBe('localhost:3002')
    })

    it('generates examples for wildcard pattern', () => {
      const examples = generateExamples('*.api.example.com')
      expect(examples.length).toBeGreaterThan(0)
      expect(examples[0]).toContain('example.com')
    })

    it('generates examples for regex pattern', () => {
      const examples = generateExamples('regex:localhost:30(0[0-9])')
      expect(examples.length).toBeGreaterThan(0)
    })
  })

  describe('getFormatName', () => {
    it('returns correct format names', () => {
      expect(getFormatName('simple')).toBe('Simple')
      expect(getFormatName('wildcard')).toBe('Wildcard')
      expect(getFormatName('regex')).toBe('Regex')
    })
  })

  describe('getFormatHelp', () => {
    it('returns help text for each format', () => {
      expect(getFormatHelp('simple')).toContain('domain')
      expect(getFormatHelp('wildcard')).toContain('*')
      expect(getFormatHelp('regex')).toContain('regex')
    })
  })

  describe('Real-world scenarios', () => {
    describe('localhost:3002 development server', () => {
      it('matches with simple pattern', () => {
        expect(matchUrl('localhost:3002', 'localhost:3002').matches).toBe(true)
        expect(matchUrl('localhost:3002', 'localhost:3002/').matches).toBe(true)
        expect(matchUrl('localhost:3002', 'localhost:3002/api/users').matches).toBe(true)
        expect(matchUrl('localhost:3002', 'localhost:3001').matches).toBe(false)
      })

      it('matches with wildcard pattern', () => {
        expect(matchUrl('localhost:300*', 'localhost:3000').matches).toBe(true)
        expect(matchUrl('localhost:300*', 'localhost:3009').matches).toBe(true)
        expect(matchUrl('localhost:300*', 'localhost:3010').matches).toBe(false)
      })

      it('matches with regex pattern', () => {
        expect(matchUrl('regex:localhost:30(0[0-9])', 'localhost:3000').matches).toBe(true)
        expect(matchUrl('regex:localhost:30(0[0-9])', 'localhost:3009').matches).toBe(true)
        expect(matchUrl('regex:localhost:30(0[0-9])', 'localhost:3010').matches).toBe(false)
      })
    })

    describe('API endpoints', () => {
      it('matches API paths with simple pattern', () => {
        expect(matchUrl('api.example.com', 'api.example.com/v1/users').matches).toBe(true)
        expect(matchUrl('api.example.com', 'api.example.com/v2/posts').matches).toBe(true)
      })

      it('matches specific API paths with wildcard', () => {
        expect(matchUrl('api.example.com/v1/*', 'api.example.com/v1/users').matches).toBe(true)
        expect(matchUrl('api.example.com/v1/*', 'api.example.com/v2/users').matches).toBe(false)
      })

      it('matches multiple API versions with regex', () => {
        expect(
          matchUrl('regex:api\\.example\\.com/v[0-9]+/.*', 'api.example.com/v1/users').matches
        ).toBe(true)
        expect(
          matchUrl('regex:api\\.example\\.com/v[0-9]+/.*', 'api.example.com/v2/posts').matches
        ).toBe(true)
      })
    })

    describe('Multi-environment matching', () => {
      it('matches all environments with wildcard', () => {
        expect(matchUrl('*.api.example.com', 'staging.api.example.com').matches).toBe(true)
        expect(matchUrl('*.api.example.com', 'prod.api.example.com').matches).toBe(true)
        expect(matchUrl('*.api.example.com', 'dev.api.example.com').matches).toBe(true)
      })

      it('matches specific environments with regex', () => {
        expect(
          matchUrl('regex:(staging|prod)-api\\.example\\.com', 'staging-api.example.com').matches
        ).toBe(true)
        expect(
          matchUrl('regex:(staging|prod)-api\\.example\\.com', 'prod-api.example.com').matches
        ).toBe(true)
        expect(
          matchUrl('regex:(staging|prod)-api\\.example\\.com', 'dev-api.example.com').matches
        ).toBe(false)
      })
    })
  })
})
