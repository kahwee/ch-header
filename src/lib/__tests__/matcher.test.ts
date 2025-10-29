import { describe, it, expect } from 'vitest'
import {
  detectFormat,
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
})
