import { vi } from 'vitest'
import { mountPopup } from '../ui/core/popup-app'
import type { Profile } from '../lib/types'
import { createChromeHarness } from './chrome-harness'

export function localProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'local',
    name: 'Local demo',
    color: 'blue',
    enabled: false,
    matchers: [{ id: 'matcher', urlFilter: '127.0.0.1:3002' }],
    requestHeaders: [{ id: 'request', header: 'X-ChHeader-Test', value: 'enabled' }],
    responseHeaders: [],
    ...overrides,
  }
}

/** Uses production markup, event wiring, controller, storage and rule generation. */
export async function createPopupHarness(profiles = [localProfile()]) {
  const chrome = createChromeHarness({ profiles, activeProfileId: profiles[0]?.id })
  vi.stubGlobal('chrome', chrome.api)
  await import('../background')
  const root = document.implementation.createHTMLDocument('Popup harness')
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
    click: (selector: string) => query(selector).click(),
    input: (selector: string, value: string) => {
      const element = query<HTMLInputElement>(selector)
      element.value = value
      element.dispatchEvent(new Event('input', { bubbles: true }))
    },
  }
}
