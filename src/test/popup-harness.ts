import { afterEach, vi } from 'vitest'
import type { Profile } from '../lib/types'
import { mountPopup } from '../ui/core/popup-app'
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

const cleanups: (() => Promise<void>)[] = []
afterEach(async () => {
  try {
    for (const cleanup of cleanups.splice(0)) await cleanup()
  } finally {
    vi.unstubAllGlobals()
    vi.resetModules()
  }
})

/** Uses production markup, event wiring, controller, storage and rule generation. */
export async function createPopupHarness(profiles = [localProfile()]) {
  const chrome = createChromeHarness({ profiles, activeProfileId: profiles[0]?.id })
  vi.stubGlobal('chrome', chrome.api)
  await import('../background')
  const root = document
  const registered: Array<() => void> = []
  const spies = [root, window].map((target: EventTarget) => {
    const originalAdd = target.addEventListener.bind(target)
    return vi.spyOn(target, 'addEventListener').mockImplementation((type, listener, options) => {
      originalAdd(type, listener, options)
      registered.push(() => target.removeEventListener(type, listener, options))
    })
  })
  cleanups.push(async () => {
    try {
      // Save continuations and background follow-up events still need Chrome and DOM.
      await chrome.settle()
    } finally {
      registered.forEach((remove) => {
        remove()
      })
      spies.forEach((spy) => {
        spy.mockRestore()
      })
      root.body.replaceChildren()
      delete root.documentElement.dataset.dropdownsReady
    }
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
