import { describe, expect, it } from 'vitest'
import { isApplicationStatus } from '../application-status'

const base = { updatedAt: 1, profileId: 'profile', profileName: 'Demo' }

describe('stored application status validation', () => {
  it.each([
    { state: 'applied', ruleCount: 1 },
    { state: 'empty', ruleCount: 0 },
    { state: 'off', ruleCount: 0, profileId: null, profileName: null },
    { state: 'missing-access', ruleCount: 0 },
    { state: 'error', ruleCount: 0 },
    { state: 'error', ruleCount: null, rulesMayBeActive: true },
  ])('accepts a consistent $state result', (status) => {
    expect(isApplicationStatus({ ...base, ...status })).toBe(true)
  })

  it.each([
    { state: 'applied', ruleCount: 0 },
    { state: 'applied', ruleCount: 1.5 },
    { state: 'applied', ruleCount: 1, profileId: null },
    { state: 'applied', ruleCount: 1, profileName: null },
    { state: 'applied', ruleCount: 1, rulesMayBeActive: true },
    { state: 'empty', ruleCount: 1 },
    { state: 'empty', ruleCount: 0, profileId: null },
    { state: 'empty', ruleCount: 0, rulesMayBeActive: true },
    { state: 'off', ruleCount: 1 },
    { state: 'off', ruleCount: 0, rulesMayBeActive: true },
    { state: 'missing-access', ruleCount: null },
    { state: 'missing-access', ruleCount: 0, rulesMayBeActive: true },
    { state: 'error', ruleCount: 1 },
    { state: 'error', ruleCount: null },
    { state: 'error', ruleCount: 0, rulesMayBeActive: true },
    { state: 'unknown', ruleCount: 0 },
    { state: 'off', ruleCount: 0, updatedAt: Number.NaN },
  ])('rejects contradictory or malformed status %#', (status) => {
    expect(isApplicationStatus({ ...base, ...status })).toBe(false)
  })

  it.each([null, undefined, 'applied', {}])('rejects missing status fields %#', (status) => {
    expect(isApplicationStatus(status)).toBe(false)
  })
})
