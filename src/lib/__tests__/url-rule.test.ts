import { describe, expect, it } from 'vitest'
import { readURLRule, writeURLRule } from '../url-rule'

describe('URL rule modes', () => {
  it('anchors sites to the host instead of matching strings in paths or queries', () => {
    expect(writeURLRule('site', 'api.example.com')).toBe('||api.example.com^')
    expect(writeURLRule('site', 'example.com:443')).toBe('||example.com:443^')
    expect(writeURLRule('site', 'http://localhost:3002/')).toBe('||localhost:3002^')
    expect(readURLRule('||api.example.com^')).toEqual({ mode: 'site', value: 'api.example.com' })
  })
  it('rejects ambiguous site inputs and requires an explicit choice for all sites', () => {
    for (const value of [
      '',
      '*.example.com',
      'example.com/api',
      'https://user:pass@example.com',
      'example.com?token=demo',
    ]) {
      expect(() => writeURLRule('site', value)).toThrow()
    }
    expect(() => writeURLRule('pattern', '')).toThrow()
    expect(() => writeURLRule('pattern', '*')).toThrow()
    expect(writeURLRule('all', '')).toBe('*')
  })
  it('preserves existing raw filters and separates regex syntax from its storage prefix', () => {
    expect(readURLRule('example.com/*')).toEqual({ mode: 'pattern', value: 'example.com/*' })
    expect(readURLRule('regex:^https://')).toEqual({ mode: 'regex', value: '^https://' })
    expect(writeURLRule('regex', '^https://')).toBe('regex:^https://')
  })
})

describe('host input ambiguity', () => {
  it('rejects characters the URL parser would silently remove or reinterpret', () => {
    for (const value of [
      'exam\nple.com',
      'exam\tple.com',
      'https:////example.com',
      'example.com\\',
      'example.com/a/..',
      'example.com/.',
    ]) {
      expect(() => writeURLRule('site', value)).toThrow()
    }
  })
})
