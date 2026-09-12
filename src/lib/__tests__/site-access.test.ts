import { describe, expect, it, vi } from 'vitest'
import { parseAccessSites, siteOrigins, suggestedAccessSites } from '../site-access'
import { buildRulesFromProfile } from '../dnr-rules'
import { createPopupHarness, localProfile } from '../../test/popup-harness'

describe('optional site access', () => {
  it('rejects wildcard, path, credentials and scheme input without widening scope', () => {
    for (const value of [
      '*',
      '*://*/*',
      '<all_urls>',
      'https://api.example.com',
      'api.example.com/path',
      'x@y.com',
      'com',
      '127.1',
      'localhost:3002',
    ]) {
      expect(() => parseAccessSites(value)).toThrow()
    }
    expect(siteOrigins(parseAccessSites('API.example.com, localhost, 127.0.0.1'))).toEqual([
      'http://*.api.example.com/*',
      'https://*.api.example.com/*',
      'http://localhost/*',
      'https://localhost/*',
      'http://127.0.0.1/*',
      'https://127.0.0.1/*',
    ])
  })

  it('suggests only explicit Site rules, never authority-looking regex or substrings', () => {
    expect(
      suggestedAccessSites(
        localProfile({
          accessSites: undefined,
          matchers: [
            { id: '1', urlFilter: '||localhost:3002^' },
            { id: '2', urlFilter: 'regex:.*example.com.*' },
            { id: '3', urlFilter: 'https://other.example/path' },
          ],
        })
      )
    ).toEqual(['localhost'])
  })

  it('forwards a composed native switch event only once', async () => {
    const h = await createPopupHarness()
    const input = h.query('#enabled').shadowRoot!.querySelector<HTMLInputElement>('input')!
    input.checked = true
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    expect(h.chrome.api.permissions.request).toHaveBeenCalledTimes(1)
    await vi.waitFor(() =>
      expect(h.chrome.snapshot().profiles).toEqual([expect.objectContaining({ enabled: true })])
    )
  })

  it('keeps denied requests off and calls the permissions API synchronously with the click', async () => {
    const h = await createPopupHarness()
    h.chrome.api.permissions.request.mockImplementationOnce((_request, callback) => callback(false))
    h.click('#enabled')
    expect(h.chrome.api.permissions.request).toHaveBeenCalledWith(
      { origins: ['http://127.0.0.1/*', 'https://127.0.0.1/*'] },
      expect.any(Function)
    )
    await vi.waitFor(() => expect(h.query('#profileNotice').textContent).toContain('not granted'))
    expect(h.chrome.snapshot().profiles).toEqual([expect.objectContaining({ enabled: false })])
    expect(h.chrome.rules()).toEqual([])
  })

  it('does not enable a changed profile after a pending permission prompt', async () => {
    const h = await createPopupHarness()
    let approve!: (granted: boolean) => void
    h.chrome.api.permissions.request.mockImplementationOnce((_request, callback) => {
      approve = callback
    })
    h.click('#enabled')
    h.input('#profileName', 'Changed while waiting')
    approve(true)
    await vi.waitFor(() =>
      expect(h.query('#profileNotice').textContent).toContain('Profile changed')
    )
    expect(h.chrome.snapshot().profiles).toEqual([expect.objectContaining({ enabled: false })])
  })

  it('confines regex rules to this profile even when other hosts have been granted', async () => {
    const h = await createPopupHarness([
      localProfile({ matchers: [{ id: 'any', urlFilter: 'regex:.*' }] }),
    ])
    h.click('#enabled')
    await vi.waitFor(() =>
      expect(h.chrome.snapshot().profiles).toEqual([expect.objectContaining({ enabled: true })])
    )
    await h.chrome.settle()
    expect(h.chrome.rules()[0].condition).toMatchObject({
      regexFilter: '.*',
      requestDomains: ['127.0.0.1'],
    })
    expect(buildRulesFromProfile(localProfile({ accessSites: [] }))).toEqual([])
    expect(buildRulesFromProfile(localProfile({ accessSites: undefined }))).toEqual([])
  })

  it('turns active profiles off and removes persistent rules after permission revocation', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    expect(h.chrome.rules()).toHaveLength(1)
    h.chrome.api.permissions.remove(
      { origins: ['http://127.0.0.1/*', 'https://127.0.0.1/*'] },
      () => {}
    )
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual([])
    expect(h.chrome.snapshot().profiles).toEqual([expect.objectContaining({ enabled: false })])
    expect(h.query('#profileEnabledStatus').textContent).toBe('Profile is off')
  })

  it('requires consent again after allowed sites change', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    h.input('#accessSites', 'localhost')
    h.query('#accessSites').dispatchEvent(new Event('change', { bubbles: true }))
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual([])
    expect(h.chrome.snapshot().profiles).toEqual([
      expect.objectContaining({ enabled: false, accessSites: ['localhost'] }),
    ])
  })

  it('clears old live rules and website grants on extension upgrade', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true })])
    await h.chrome.settle()
    h.chrome.api.runtime.onInstalled.emit()
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual([])
    expect(h.chrome.snapshot().profiles).toEqual([expect.objectContaining({ enabled: false })])
    expect(h.chrome.api.permissions.remove).toHaveBeenCalled()
  })

  it('never applies an old profile without an explicit site list', async () => {
    const h = await createPopupHarness([localProfile({ enabled: true, accessSites: undefined })])
    await h.chrome.settle()
    expect(h.chrome.rules()).toEqual([])
    expect(h.chrome.snapshot().profiles).toEqual([expect.objectContaining({ enabled: false })])
  })
})
