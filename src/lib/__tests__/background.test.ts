import { afterEach, describe, expect, it, vi } from 'vitest'
import { createChromeHarness } from '../../test/chrome-harness'
import { localProfile } from '../../test/popup-harness'
import { APPLICATION_STATUS_KEY, isApplicationStatus } from '../application-status'

async function setup(enabled = true) {
  const profile = localProfile({ enabled })
  const harness = createChromeHarness({ profiles: [profile], activeProfileId: profile.id })
  vi.stubGlobal('chrome', harness.api)
  await import('../../background')
  return harness
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
  vi.restoreAllMocks()
})

describe('background rule updates', () => {
  it('persists successful application and updates the toolbar without claiming a request matched', async () => {
    const h = await setup()
    await h.settle()
    expect(h.snapshot()[APPLICATION_STATUS_KEY]).toMatchObject({
      state: 'applied',
      profileName: 'Local demo',
      ruleCount: 1,
    })
    expect(h.api.action.setBadgeText).toHaveBeenLastCalledWith({ text: 'ON' })
    expect(h.api.action.setTitle).toHaveBeenLastCalledWith({
      title: 'ChHeader: Local demo — 1 rule applied',
    })
  })

  it('does not disable accepted rules when toolbar presentation fails', async () => {
    const h = await setup()
    h.api.action.setBadgeText.mockRejectedValueOnce(new Error('Toolbar unavailable'))
    expect(await h.settle()).toMatchObject({ ok: true })
    expect(h.rules()).toHaveLength(1)
    expect(h.snapshot()[APPLICATION_STATUS_KEY]).toMatchObject({ state: 'applied', ruleCount: 1 })
    expect(h.api.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledTimes(1)
  })

  it('does not disable accepted rules when diagnostics cannot be saved', async () => {
    const h = await setup()
    const original = h.api.storage.local.set.getMockImplementation()!
    h.api.storage.local.set.mockImplementation((values, callback) => {
      if (APPLICATION_STATUS_KEY in values) return Promise.reject(new Error('Storage unavailable'))
      return original(values, callback)
    })
    expect(await h.settle()).toMatchObject({ ok: false })
    expect(h.rules()).toHaveLength(1)
    expect(h.api.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledTimes(1)
  })

  it('publishes a fresh revision when the clock has not advanced', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000)
    const h = await setup()
    await h.settle()
    const first = h.snapshot()[APPLICATION_STATUS_KEY]
    expect(isApplicationStatus(first)).toBe(true)
    await h.settle()
    const second = h.snapshot()[APPLICATION_STATUS_KEY]
    expect(isApplicationStatus(second)).toBe(true)
    if (isApplicationStatus(first) && isApplicationStatus(second)) {
      expect(second.updatedAt).toBe(first.updatedAt + 1)
    }
  })

  it('clears the badge when off or when an enabled profile has no rules', async () => {
    const h = await setup(false)
    await h.settle()
    expect(h.snapshot()[APPLICATION_STATUS_KEY]).toMatchObject({ state: 'off', ruleCount: 0 })
    await h.api.storage.local.set({ profiles: [localProfile({ enabled: true, matchers: [] })] })
    await h.settle()
    expect(h.snapshot()[APPLICATION_STATUS_KEY]).toMatchObject({ state: 'empty', ruleCount: 0 })
    expect(h.api.action.setBadgeText).toHaveBeenLastCalledWith({ text: '' })
  })

  it('retains a missing-access explanation after disabling the profile and subsequent applies', async () => {
    const h = await setup()
    h.api.permissions.contains.mockImplementation((_permissions, callback) => callback(false))
    await h.settle()
    await h.settle()
    expect(h.snapshot()[APPLICATION_STATUS_KEY]).toMatchObject({
      state: 'missing-access',
      ruleCount: 0,
    })
    expect(h.rules()).toEqual([])
    expect(h.api.action.setBadgeText).toHaveBeenLastCalledWith({ text: '' })
  })

  it('retains sanitized rejection details after cleanup and recovers on a new activation', async () => {
    const h = await setup()
    await h.settle()
    h.api.declarativeNetRequest.updateDynamicRules.mockRejectedValueOnce(
      new Error('secret header value')
    )
    const result = await h.settle()
    await h.settle()
    expect(result).toMatchObject({ ok: false })
    expect(h.snapshot()[APPLICATION_STATUS_KEY]).toMatchObject({
      state: 'error',
      ruleCount: 0,
      rulesMayBeActive: false,
    })
    expect(JSON.stringify(h.snapshot()[APPLICATION_STATUS_KEY])).not.toContain('secret')
    expect(h.rules()).toEqual([])
    await h.api.storage.local.set({ profiles: [localProfile({ enabled: true })] })
    await h.settle()
    expect(h.snapshot()[APPLICATION_STATUS_KEY]).toMatchObject({ state: 'applied', ruleCount: 1 })
  })

  it('shows uncertainty when both replacement and cleanup fail', async () => {
    const h = await setup()
    await h.settle()
    h.api.declarativeNetRequest.updateDynamicRules.mockRejectedValue(new Error('private value'))
    await h.settle()
    expect(h.snapshot()[APPLICATION_STATUS_KEY]).toMatchObject({
      state: 'error',
      ruleCount: null,
      rulesMayBeActive: true,
    })
    expect(h.api.action.setBadgeText).toHaveBeenLastCalledWith({ text: '!' })
    expect(h.rules()).toHaveLength(1)
  })

  it('serializes overlapping applications', async () => {
    const h = await setup()
    const original = h.api.declarativeNetRequest.updateDynamicRules.getMockImplementation()!
    let release!: () => void
    h.api.declarativeNetRequest.updateDynamicRules.mockImplementationOnce(async (update) => {
      await new Promise<void>((resolve) => {
        release = resolve
      })
      return original(update)
    })
    const first = h.settle()
    const second = h.settle()
    await vi.waitFor(() =>
      expect(h.api.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledTimes(1)
    )
    release()
    await Promise.all([first, second])
    expect(h.api.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledTimes(2)
    expect(h.rules()).toHaveLength(1)
  })
})
