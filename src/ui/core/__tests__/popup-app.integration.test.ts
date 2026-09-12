import { describe, expect, it } from 'vitest'
import { createPopupHarness, localProfile } from '../../../test/popup-harness'

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
    expect(h.query('#profileEnabledStatus').textContent).toBe('Profile is off')
    h.click('#enabled')
    await h.chrome.settle()
    expect(h.query('#profileEnabledStatus').textContent).toBe('Profile is on')
    expect(h.chrome.rules()).toHaveLength(1)
    expect(h.chrome.rules()[0].action.requestHeaders?.[0].value).toBe('enabled')
    expect(h.chrome.rules()[0].condition.resourceTypes).toContain('main_frame')
    h.click('a[data-id="local"]')
    await h.chrome.settle()
    expect(h.chrome.rules()).toHaveLength(1)
    expect(h.query('#status-second').textContent).toBe('On')
    expect(h.query('#profileEnabledStatus').textContent).toBe('Profile is off')
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
    expect(h.query('#matchers').querySelectorAll('[data-component]')).toHaveLength(2)
  })

  it('preserves header input focus while changing profile metadata', async () => {
    const h = await createPopupHarness()
    const header = h.query<HTMLInputElement>('#reqHeaders input[type="text"]')
    header.focus()
    h.input('#profileName', 'Updated')
    expect(h.query('#reqHeaders input[type="text"]')).toBe(header)
    expect(h.root.activeElement).toBe(header)
    await h.chrome.settle()
  })
})

describe('URL rule safety through real modules', () => {
  it('keeps drafts out of storage, rejects invalid regex, and saves a validated repair', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    const originalRules = h.chrome.rules()
    const mode = h.query<HTMLSelectElement>('[data-role="mode"]')
    mode.value = 'regex'
    mode.dispatchEvent(new Event('change', { bubbles: true }))
    h.input('[data-role="urlFilter"]', '[')
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual(originalRules)
    h.chrome.api.declarativeNetRequest.isRegexSupported.mockResolvedValue({ isSupported: false })
    h.query('[data-role="urlFilter"]').dispatchEvent(new Event('change', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(h.query('[data-role="ruleFeedback"]').textContent).toContain('Last saved rule kept')
    expect(h.chrome.rules()).toEqual(originalRules)
    h.chrome.api.declarativeNetRequest.isRegexSupported.mockResolvedValue({ isSupported: true })
    h.input('[data-role="urlFilter"]', '^http://127\\.0\\.0\\.1:3002/match/')
    h.query('[data-role="urlFilter"]').dispatchEvent(new Event('change', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 0))
    await h.chrome.settle()
    expect(h.chrome.rules()[0].condition.regexFilter).toBe('^http://127\\.0\\.0\\.1:3002/match/')
  })

  it('validates imported regexes before replacing live rules and can always disable afterward', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    const originalRules = h.chrome.rules()
    h.chrome.api.declarativeNetRequest.isRegexSupported.mockResolvedValue({ isSupported: false })
    await h.chrome.api.storage.local.set({
      profiles: [localProfile({ enabled: true, matchers: [{ id: 'bad', urlFilter: 'regex:[' }] })],
    })
    expect(await h.chrome.settle()).toMatchObject({ ok: false })
    expect(h.chrome.rules()).toEqual(originalRules)
    await h.chrome.api.storage.local.set({ profiles: [localProfile({ enabled: false })] })
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual([])
  })

  it('does not widen scope when the final URL rule is deleted', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    h.click('[data-action="removeMatcher"]')
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual([])
  })
})

describe('adversarial editor interactions', () => {
  it('keeps an unsaved URL draft and its input when another row is added', async () => {
    const h = await createPopupHarness()
    h.input('[data-role="urlFilter"]', 'unfinished-draft')
    const input = h.query<HTMLInputElement>('[data-role="urlFilter"]')
    input.focus()
    h.click('#addReq')
    expect(h.query('[data-role="urlFilter"]')).toBe(input)
    expect(input.value).toBe('unfinished-draft')
    expect(h.chrome.snapshot().profiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          matchers: [expect.objectContaining({ urlFilter: '127.0.0.1:3002' })],
        }),
      ])
    )
  })
})

describe('delayed regex validation', () => {
  it('ignores an older validation result after the user makes a newer edit', async () => {
    const h = await createPopupHarness()
    const mode = h.query<HTMLSelectElement>('[data-role="mode"]')
    mode.value = 'regex'
    mode.dispatchEvent(new Event('change', { bubbles: true }))
    let finishOld!: (result: { isSupported: boolean }) => void
    h.chrome.api.declarativeNetRequest.isRegexSupported.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishOld = resolve
        })
    )
    h.input('[data-role="urlFilter"]', '^http://127\\.0\\.0\\.1:3002/old/')
    h.query('[data-role="urlFilter"]').dispatchEvent(new Event('change', { bubbles: true }))
    h.input('[data-role="urlFilter"]', '^http://127\\.0\\.0\\.1:3002/new/')
    h.query('[data-role="urlFilter"]').dispatchEvent(new Event('change', { bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve, 0))
    finishOld({ isSupported: true })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(h.chrome.snapshot().profiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          matchers: [
            expect.objectContaining({ urlFilter: 'regex:^http://127\\.0\\.0\\.1:3002/new/' }),
          ],
        }),
      ])
    )
  })

  it('finishes validation across unrelated row additions without reviving removed rules', async () => {
    const h = await createPopupHarness()
    const mode = h.query<HTMLSelectElement>('[data-role="mode"]')
    mode.value = 'regex'
    mode.dispatchEvent(new Event('change', { bubbles: true }))
    let finish!: (result: { isSupported: boolean }) => void
    h.chrome.api.declarativeNetRequest.isRegexSupported.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        })
    )
    h.input('[data-role="urlFilter"]', '^http://127\\.0\\.0\\.1:3002/')
    h.query('[data-role="urlFilter"]').dispatchEvent(new Event('change', { bubbles: true }))
    h.click('#addReq')
    finish({ isSupported: true })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(h.query('[data-role="ruleFeedback"]').textContent).toBe('Rule validated.')
    h.chrome.api.declarativeNetRequest.isRegexSupported.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        })
    )
    h.input('[data-role="urlFilter"]', '^http://127\\.0\\.0\\.1:3002/deleted/')
    h.query('[data-role="urlFilter"]').dispatchEvent(new Event('change', { bubbles: true }))
    h.click('[data-action="removeMatcher"]')
    finish({ isSupported: true })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(h.chrome.snapshot().profiles).toEqual(
      expect.arrayContaining([expect.objectContaining({ matchers: [] })])
    )
  })
})

describe('storage failure recovery', () => {
  it('reports failed edits and retries persistence before Apply', async () => {
    const h = await createPopupHarness()
    h.chrome.api.storage.local.set.mockRejectedValueOnce(new Error('Storage unavailable'))
    h.input('#profileName', 'Retry demo')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(h.query('#profileNotice').textContent).toContain('Changes could not be saved')
    expect(h.chrome.snapshot().profiles).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Local demo' })])
    )
    h.query('#detail').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(h.chrome.snapshot().profiles).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Retry demo' })])
    )
  })
})
