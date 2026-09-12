import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPopupHarness, localProfile } from '../../../test/popup-harness'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('real popup through storage to background rules', () => {
  it('keeps selection separate from activation, persists edits, and clears disabled rules', async () => {
    const h = await createPopupHarness([
      localProfile(),
      localProfile({ id: 'second', name: 'Second' }),
    ])
    h.click('a[data-id="second"]')
    h.input('#profileName', 'Renamed demo')
    expect(h.chrome.snapshot().profiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'second', name: 'Renamed demo', enabled: false }),
      ])
    )
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual([])
    h.click('#enabled')
    await h.chrome.settle()
    expect(h.chrome.rules()).toHaveLength(1)
    expect(h.chrome.rules()[0].action.requestHeaders?.[0].value).toBe('enabled')
    expect(h.chrome.rules()[0].condition.resourceTypes).toContain('main_frame')
    h.click('a[data-id="local"]')
    await h.chrome.settle()
    expect(h.chrome.rules()).toHaveLength(1)
    expect(h.query('#status-second').textContent).toBe('On')
    h.click('a[data-id="second"]')
    h.click('#enabled')
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual([])
  })

  it('adds rows through actual buttons and Apply does not submit navigation or delete rows', async () => {
    const h = await createPopupHarness()
    h.click('#addReq')
    h.click('#addMatcher')
    const before = h.chrome.snapshot()
    const submit = new Event('submit', { bubbles: true, cancelable: true })
    h.query('#detail').dispatchEvent(submit)
    expect(submit.defaultPrevented).toBe(true)
    await h.chrome.settle()
    expect(h.chrome.snapshot()).toEqual(before)
    expect(h.query('#reqHeaders').querySelectorAll('tr')).toHaveLength(2)
    expect(h.query('#matchers').querySelectorAll('tr')).toHaveLength(2)
  })

  it('preserves header input focus while changing profile metadata', async () => {
    const h = await createPopupHarness()
    const header = h.query<HTMLInputElement>('#reqHeaders input[type="text"]')
    header.focus()
    h.input('#profileName', 'Updated')
    expect(h.query('#reqHeaders input[type="text"]')).toBe(header)
  })
})
