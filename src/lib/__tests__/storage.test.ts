import { afterEach, describe, expect, it, vi } from 'vitest'
import { createChromeHarness } from '../../test/chrome-harness'
import { initializeStorage } from '../storage'

afterEach(() => vi.unstubAllGlobals())
describe('first-run storage', () => {
  it('starts empty and never creates or enables sample rules', async () => {
    const h = createChromeHarness()
    vi.stubGlobal('chrome', h.api)
    await initializeStorage()
    expect(h.snapshot()).toEqual({ profiles: [], activeProfileId: null })
    await initializeStorage()
    expect(h.api.storage.local.set).toHaveBeenCalledTimes(1)
  })
  it('preserves an intentionally empty library on extension updates', async () => {
    const h = createChromeHarness({ profiles: [] })
    vi.stubGlobal('chrome', h.api)
    await initializeStorage()
    expect(h.api.storage.local.set).not.toHaveBeenCalled()
  })
})
