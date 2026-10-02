import { describe, expect, it, vi } from 'vitest'
import type { Profile } from '../../../lib/types'
import { createPopupHarness, localProfile } from '../../../test/popup-harness'

describe('application feedback through the production popup', () => {
  it('autosaves without an Apply button and only offers Retry after a failed acknowledgement', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    expect(h.root.querySelector('#apply')).toBeNull()
    expect(h.query('#retryAction').hidden).toBe(true)
    h.chrome.api.runtime.sendMessage.mockRejectedValueOnce(new Error('Disconnected'))
    h.input('#profileName', 'Autosaved demo')
    await vi.waitFor(() => expect(h.query('#retryAction').hidden).toBe(false))
    await h.chrome.settle()
    expect(h.query('#retryAction').hidden).toBe(false)
    h.query('#retry').focus()
    h.click('#retry')
    expect(h.query<HTMLButtonElement>('#retry').disabled).toBe(true)
    // Chrome blurs a button when it becomes disabled; jsdom does not.
    h.query('#retry').blur()
    await h.chrome.settle()
    expect(h.query('#retryAction').hidden).toBe(true)
    expect(h.root.activeElement).toBe(h.query('#applicationStatus'))
    expect(h.query('#applicationStatus').textContent).toContain('Saved · Applied')
  })

  it('reports applied rules separately from selection and zero-rule profiles', async () => {
    const h = await createPopupHarness([
      localProfile(),
      localProfile({ id: 'empty', name: 'Empty', requestHeaders: [] }),
    ])
    h.click('#enabled')
    await h.chrome.settle()
    expect(h.query('#applicationStatus').textContent).toContain('Applied · 1 URL rule')
    expect(h.chrome.api.action.setBadgeText).toHaveBeenLastCalledWith({ text: 'ON' })
    h.click('a[data-id="empty"]')
    expect(h.query('#applicationStatus').textContent).toContain('Off ·')
    expect(h.chrome.rules()).toHaveLength(1)
    h.click('#enabled')
    await h.chrome.settle()
    expect(h.query('#applicationStatus').dataset.state).toBe('empty')
    expect(h.query('#applicationStatus').textContent).toMatch(/header/i)
    expect(h.chrome.api.action.setBadgeText).toHaveBeenLastCalledWith({ text: '' })
  })

  it('retries both profiles and activation after an activation save fails', async () => {
    const h = await createPopupHarness([
      localProfile(),
      localProfile({ id: 'second', name: 'Second' }),
    ])
    h.click('a[data-id="second"]')
    h.chrome.api.storage.local.set.mockRejectedValueOnce(new Error('Unavailable'))
    h.click('#enabled')
    await h.chrome.settle()
    expect(h.query('#applicationStatus').textContent).toContain('Not saved')
    expect(h.chrome.snapshot().activeProfileId).toBe('local')
    expect(h.query('#retryAction').hidden).toBe(false)
    h.click('#retry')
    await h.chrome.settle()
    expect(h.chrome.snapshot().activeProfileId).toBe('second')
    expect(
      (h.chrome.snapshot().profiles as Profile[]).find((p) => p.id === 'second')?.enabled
    ).toBe(true)
    expect(h.chrome.rules()).toHaveLength(1)
    expect(h.query('#retryAction').hidden).toBe(true)
    expect(h.query('#applicationStatus').textContent).toContain('Applied ·')
    expect(h.query('#profileNotice').hidden).toBe(true)
  })

  it('finishes same-value saves without relying on a storage-change notification', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    h.input('#profileName', 'Local demo')
    await vi.waitFor(() => expect(h.query('#applicationStatus').textContent).toContain('Applied ·'))
  })

  it('keeps a rule rejection visible after automatic disabling and a later retry', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    h.chrome.api.declarativeNetRequest.updateDynamicRules.mockRejectedValueOnce(
      new Error('Rejected private header value')
    )
    h.input('#profileName', 'Rejected demo')
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual([])
    expect(h.query('#applicationStatus').dataset.state).toBe('error')
    expect(h.query('#applicationStatus').textContent).not.toContain('private header value')
    expect(h.query('#retryAction').hidden).toBe(false)
    h.click('#retry')
    await h.chrome.settle()
    expect(h.query('#applicationStatus').dataset.state).toBe('error')
    expect(h.query('#applicationStatus').textContent).not.toContain('remain active')
  })
})
