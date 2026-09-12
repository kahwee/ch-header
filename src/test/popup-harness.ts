import { afterEach, vi } from 'vitest'
import { mountPopup } from '../ui/core/popup-app'
import type { Profile } from '../lib/types'
import { createChromeHarness } from './chrome-harness'

export function localProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'local',
    name: 'Local demo',
    color: 'blue',
    enabled: false,
    accessSites: ['127.0.0.1'],
    matchers: [{ id: 'matcher', urlFilter: '127.0.0.1:3002' }],
    requestHeaders: [{ id: 'request', header: 'X-ChHeader-Test', value: 'enabled' }],
    responseHeaders: [],
    ...overrides,
  }
}

const cleanups: (() => void)[] = []
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => {
    cleanup()
  })
  vi.unstubAllGlobals()
  vi.resetModules()
})

/** Uses production markup, event wiring, controller, storage and rule generation. */
export async function createPopupHarness(profiles = [localProfile()]) {
  const chrome = createChromeHarness({ profiles, activeProfileId: profiles[0]?.id })
  vi.stubGlobal('chrome', chrome.api)
  await import('../background')
  const root = document
  const originalAdd = root.addEventListener.bind(root)
  const registered: Array<() => void> = []
  const spy = vi.spyOn(root, 'addEventListener').mockImplementation((type, listener, options) => {
    originalAdd(type, listener, options)
    registered.push(() => root.removeEventListener(type, listener, options))
  })
  cleanups.push(() => {
    registered.forEach((remove) => {
      remove()
    })
    spy.mockRestore()
    root.body.replaceChildren()
    delete root.documentElement.dataset.dropdownsReady
  })
  root.body.innerHTML = '<div id="root"></div>'
  await mountPopup(root)
  const query = <T extends HTMLElement = HTMLElement>(selector: string): T => {
    const element = root.querySelector<T>(selector)
    if (!element) throw new Error(`Popup element missing: ${selector}`)
    return element
  }
  return {
    root,
    chrome,
    query,
    click: (selector: string) => {
      const element = query(selector)
      const control = element.shadowRoot?.querySelector<HTMLInputElement>('input')
      ;(control ?? element).click()
    },
    input: (selector: string, value: string) => {
      const element = query<HTMLInputElement>(selector)
      element.value = value
      element.dispatchEvent(new Event('input', { bubbles: true }))
    },
  }
}
