import { describe, expect, it } from 'vitest'
import { createPopupHarness, localProfile } from '../../../test/popup-harness'

describe('header validation through the production popup', () => {
  it('keeps invalid names out of saved rules, preserves the draft through edits, and saves a repair', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    const originalRules = h.chrome.rules()
    const originalName = localProfile().requestHeaders[0].header
    const input = h.query<HTMLInputElement>('#reqHeaders [data-role="header"]')
    input.focus()
    for (let length = 1; length <= 'Bad Header'.length; length++) {
      h.input('#reqHeaders [data-role="header"]', 'Bad Header'.slice(0, length))
      await h.chrome.settle()
      expect(h.chrome.rules()).toEqual(originalRules)
    }
    input.dispatchEvent(new Event('change', { bubbles: true }))
    expect(h.chrome.rules()).toEqual(originalRules)
    expect(h.chrome.snapshot().profiles).toEqual([
      expect.objectContaining({
        requestHeaders: [expect.objectContaining({ header: originalName })],
      }),
    ])
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const feedback = h.root.getElementById(input.getAttribute('aria-describedby')!)!
    expect(feedback.hidden).toBe(false)
    expect(feedback.textContent).toContain('Last saved name kept')

    h.click('#addReq')
    h.input('#profileName', 'Updated profile')
    await h.chrome.settle()
    expect(h.query('#reqHeaders [data-role="header"]')).toBe(input)
    expect(h.root.activeElement).toBe(input)
    expect(input.value).toBe('Bad Header')
    expect(h.chrome.rules()).toEqual(originalRules)
    expect(h.chrome.snapshot().profiles).toEqual([expect.objectContaining({ enabled: true })])

    h.input('#reqHeaders [data-role="header"]', 'X-Repaired')
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual(originalRules)
    h.click('#addRes')
    expect(input.value).toBe('X-Repaired')
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await h.chrome.settle()
    expect(input.getAttribute('aria-invalid')).toBe('false')
    expect(feedback.hidden).toBe(true)
    expect(h.chrome.snapshot().profiles).toEqual([
      expect.objectContaining({
        requestHeaders: expect.arrayContaining([expect.objectContaining({ header: 'X-Repaired' })]),
      }),
    ])
    expect(h.chrome.rules()[0].action.requestHeaders?.[0].header).toBe('X-Repaired')
  })

  it('saves a valid name on Enter before Apply without canceling form submission', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    h.input('#reqHeaders [data-role="header"]', 'X-Keyboard')
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    h.query('#reqHeaders [data-role="header"]').dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(false)
    // jsdom does not perform the keyboard's native implicit form submission.
    h.query('#detail').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await h.chrome.settle()
    expect(h.chrome.rules()[0].action.requestHeaders?.[0].header).toBe('X-Keyboard')
  })

  it('keeps an empty edited name as a draft and rejects multiline value paste before browser sanitization', async () => {
    const h = await createPopupHarness([
      localProfile({
        enabled: true,
        responseHeaders: [{ id: 'response', header: 'X-Response-Test', value: 'original' }],
      }),
    ])
    await h.chrome.settle()
    const originalRules = h.chrome.rules()
    h.input('#resHeaders [data-role="header"]', '')
    expect(h.query('#resHeaders [data-role="header"]').getAttribute('aria-invalid')).toBe('true')
    const value = h.query<HTMLInputElement>('#resHeaders [data-role="value"]')
    const originalValue = value.value
    const paste = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => 'first\r\nInjected: second' },
    })
    value.dispatchEvent(paste)
    await h.chrome.settle()
    expect(paste.defaultPrevented).toBe(true)
    expect(value.value).toBe(originalValue)
    expect(value.getAttribute('aria-invalid')).toBe('true')
    expect(h.query('#resHeaders [data-role="valueFeedback"]').textContent).toContain(
      'pasted text was not inserted'
    )
    expect(h.chrome.rules()).toEqual(originalRules)
    expect(h.chrome.snapshot().profiles).toEqual([expect.objectContaining({ enabled: true })])

    h.input('#resHeaders [data-role="value"]', 'repaired')
    await h.chrome.settle()
    expect(value.getAttribute('aria-invalid')).toBe('false')
    expect(h.chrome.rules()[0].action.responseHeaders?.[0].value).toBe('repaired')
  })
})
