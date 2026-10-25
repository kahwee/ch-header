import { describe, expect, it } from 'vitest'
import { headerNameError, headerValueError } from '../header-validation'

describe('header field validation', () => {
  it('rejects ASCII control characters while allowing horizontal tabs', () => {
    expect(headerValueError('first\tsecond')).toBeNull()
    for (const code of [0, 1, 8, 11, 12, 14, 31, 127]) {
      expect(headerValueError(`first${String.fromCharCode(code)}second`)).not.toBeNull()
    }
  })
  it('accepts token names and rejects empty names, whitespace and non-token characters', () => {
    expect(headerNameError("X-Token_!#$%&'*+.^`|~123")).toBeNull()
    for (const name of ['', 'Bad Header', 'Name:', 'Name\t', 'Näme', 'X\r\nInjected'])
      expect(headerNameError(name)).not.toBeNull()
  })

  it('accepts empty and ordinary values but rejects either line break', () => {
    expect(headerValueError('')).toBeNull()
    expect(headerValueError('Bearer token: with punctuation')).toBeNull()
    for (const value of ['one\rtwo', 'one\ntwo', 'one\r\ntwo'])
      expect(headerValueError(value)).not.toBeNull()
  })
})
