import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createPopupHarness, localProfile } from '../popup-harness'

describe('popup harness teardown', () => {
  const errors: unknown[][] = []
  const originalError = console.error
  let restoreError: () => void

  beforeAll(() => {
    const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errors.push(args)
      originalError(...args)
    })
    restoreError = () => spy.mockRestore()
  })

  afterAll(() => {
    restoreError()
    // This runs after harness afterEach, including its global and DOM cleanup.
    expect(errors).toEqual([])
  })

  it('finishes a pending popup save before removing the Chrome global', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    h.input('#profileName', 'Saved during teardown')
    // Intentionally leave the save/application chain for harness teardown.
    expect(h.chrome.snapshot()).toMatchObject({ profiles: [{ name: 'Saved during teardown' }] })
  })

  it('finishes upgrade-triggered permission and storage updates before cleanup', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    h.chrome.api.runtime.onInstalled.emit()
    await h.chrome.settle()
    expect(h.chrome.snapshot()).toMatchObject({ profiles: [{ enabled: false }] })
  })
})
