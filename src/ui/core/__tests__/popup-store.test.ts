import { describe, expect, it, vi } from 'vitest'
import type { Profile } from '../../../lib/types'
import { PopupStore } from '../popup-store'

const profile = (name: string): Profile => ({
  id: name,
  name,
  color: 'blue',
  enabled: false,
  matchers: [],
  requestHeaders: [],
  responseHeaders: [],
})

describe('PopupStore', () => {
  it('loads the saved active profile and falls back to the first profile', async () => {
    const get = vi.fn().mockResolvedValue({ profiles: [profile('first')] })
    vi.stubGlobal('chrome', { storage: { local: { get, set: vi.fn() } } })
    await expect(new PopupStore().load()).resolves.toEqual({
      profiles: [profile('first')],
      activeProfileId: 'first',
    })
  })

  it('serializes immutable snapshots and continues after a failed write', async () => {
    const finishes: Array<() => void> = []
    const writes: unknown[] = []
    const set = vi.fn((values: unknown) => {
      writes.push(values)
      return new Promise<void>((resolve, reject) =>
        finishes.push(writes.length === 1 ? () => reject(new Error('failed')) : resolve)
      )
    })
    vi.stubGlobal('chrome', { storage: { local: { get: vi.fn(), set } } })
    const store = new PopupStore()
    const profiles = [profile('first')]
    const first = store.save(profiles)
    profiles[0].name = 'mutated later'
    const second = store.save(profiles, 'first')
    expect(set).toHaveBeenCalledTimes(1)
    expect(writes[0]).toEqual({ profiles: [profile('first')] })
    finishes[0]()
    await expect(first).rejects.toThrow('failed')
    await vi.waitFor(() => expect(set).toHaveBeenCalledTimes(2))
    expect(writes[1]).toEqual({ profiles, activeProfileId: 'first' })
    finishes[1]()
    await expect(second).resolves.toBeUndefined()
  })
})
