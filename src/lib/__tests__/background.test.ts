import { describe, it, expect, vi, afterEach } from 'vitest'

const storage = vi.hoisted(() => ({ getActiveProfile: vi.fn(), initializeStorage: vi.fn() }))
const dnr = vi.hoisted(() => ({ buildRulesFromProfile: vi.fn(() => []), applyDNRRules: vi.fn() }))
vi.mock('../storage', () => storage)
vi.mock('../dnr-rules', () => dnr)

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
  vi.clearAllMocks()
})

describe('background rule updates', () => {
  it('serializes overlapping events and continues after a rejected update', async () => {
    let change!: (changes: object, area: string) => void
    let message!: (msg: object, sender: object, reply: (result: unknown) => void) => boolean
    vi.stubGlobal('chrome', {
      runtime: {
        onInstalled: { addListener: vi.fn() },
        onMessage: {
          addListener: (fn: typeof message) => {
            message = fn
          },
        },
      },
      storage: {
        onChanged: {
          addListener: (fn: typeof change) => {
            change = fn
          },
        },
      },
    })
    let release!: () => void
    storage.getActiveProfile.mockResolvedValue(null)
    dnr.applyDNRRules.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        })
    )
    dnr.applyDNRRules.mockResolvedValue(undefined)
    await import('../../background')
    change({ profiles: {} }, 'local')
    const reply = vi.fn()
    message({ type: 'applyNow' }, {}, reply)
    await vi.waitFor(() => expect(dnr.applyDNRRules).toHaveBeenCalledTimes(1))
    expect(storage.getActiveProfile).toHaveBeenCalledTimes(1)
    release()
    await vi.waitFor(() => expect(reply).toHaveBeenCalledWith({ ok: true }))
    expect(dnr.applyDNRRules).toHaveBeenCalledTimes(2)

    dnr.applyDNRRules.mockRejectedValueOnce(new Error('invalid rule'))
    const failed = vi.fn()
    const recovered = vi.fn()
    message({ type: 'applyNow' }, {}, failed)
    message({ type: 'applyNow' }, {}, recovered)
    await vi.waitFor(() => expect(recovered).toHaveBeenCalledWith({ ok: true }))
    expect(failed).toHaveBeenCalledWith({ ok: false, error: 'Error: invalid rule' })
  })
})
