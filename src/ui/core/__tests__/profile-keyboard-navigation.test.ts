import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPopupHarness, localProfile } from '../../../test/popup-harness'

function press(target: EventTarget, key: string, modifiers: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...modifiers,
  })
  target.dispatchEvent(event)
  return event
}

beforeEach(() => {
  // jsdom has no layout; keep the production scrolling call executable.
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
})

afterAll(() => {
  // A disposed popup must no longer intercept browser shortcuts.
  expect(press(window, 'k', { ctrlKey: true }).defaultPrevented).toBe(false)
})

async function setup() {
  const h = await createPopupHarness([
    localProfile({ id: 'first', name: 'First', enabled: true }),
    localProfile({ id: 'second', name: 'Second', notes: 'Debug API' }),
    localProfile({ id: 'third', name: 'Third' }),
  ])
  await h.chrome.settle()
  const search = h.query<HTMLInputElement>('#sidebarSearch')
  search.focus()
  const selectedId = () => h.query('#profileList [aria-selected="true"]').dataset.id
  return { ...h, search, selectedId }
}

describe('profile keyboard navigation through the production popup', () => {
  it.each([{ ctrlKey: true }, { metaKey: true }])(
    'focuses search with the platform shortcut %j',
    async (modifiers) => {
      const h = await setup()
      const editor = h.query<HTMLInputElement>('#profileName')
      editor.focus()
      expect(press(editor, 'K', modifiers).defaultPrevented).toBe(true)
      expect(h.root.activeElement).toBe(h.search)
    }
  )

  it('moves within list boundaries without changing enabled profiles or rules', async () => {
    const h = await setup()
    const before = h.chrome.snapshot()
    const rules = h.chrome.rules()
    for (const id of ['first', 'second', 'third', 'third']) {
      expect(press(h.search, 'ArrowDown').defaultPrevented).toBe(true)
      expect(h.selectedId()).toBe(id)
      expect(h.query('#profileList .keyboard-focus').dataset.id).toBe(id)
    }
    expect(h.query<HTMLInputElement>('#profileName').value).toBe('Third')
    expect(press(h.search, 'Enter').defaultPrevented).toBe(true)
    expect(h.selectedId()).toBe('third')
    for (const id of ['second', 'first', 'first']) {
      press(h.search, 'ArrowUp')
      expect(h.selectedId()).toBe(id)
    }
    await h.chrome.settle()
    expect(h.chrome.snapshot()).toEqual(before)
    expect(h.chrome.rules()).toEqual(rules)
    expect(h.root.activeElement).toBe(h.search)
  })

  it('starts at the first result with ArrowUp and resets navigation after filtering', async () => {
    const h = await setup()
    press(h.search, 'ArrowUp')
    expect(h.selectedId()).toBe('first')
    press(h.search, 'ArrowDown')
    press(h.search, 'ArrowDown')
    h.input('#sidebarSearch', 'debug')
    expect(h.root.querySelector('#profileList .keyboard-focus')).toBeNull()
    expect(press(h.search, 'Enter').defaultPrevented).toBe(false)
    press(h.search, 'ArrowDown')
    expect(h.selectedId()).toBe('second')
    expect(h.query<HTMLInputElement>('#profileName').value).toBe('Second')
    h.input('#sidebarSearch', '')
    press(h.search, 'ArrowDown')
    expect(h.selectedId()).toBe('first')
  })

  it('leaves an empty result set and other editor inputs alone', async () => {
    const h = await setup()
    h.input('#sidebarSearch', 'no matches')
    for (const key of ['ArrowDown', 'ArrowUp', 'Enter']) {
      expect(press(h.search, key).defaultPrevented).toBe(false)
    }
    expect(h.query('#noResults').hidden).toBe(false)
    expect(h.query<HTMLInputElement>('#profileName').value).toBe('First')
    h.input('#sidebarSearch', '')
    const editor = h.query<HTMLInputElement>('#profileName')
    editor.focus()
    for (const key of ['ArrowDown', 'ArrowUp', 'Enter', 'k']) {
      expect(press(editor, key).defaultPrevented).toBe(false)
    }
    expect(h.selectedId()).toBe('first')
    expect(h.root.activeElement).toBe(editor)
  })

  it('clears the keyboard highlight and releases search focus with Escape', async () => {
    const h = await setup()
    press(h.search, 'ArrowDown')
    press(h.search, 'ArrowDown')
    expect(press(h.search, 'Escape').defaultPrevented).toBe(true)
    expect(h.root.querySelector('#profileList .keyboard-focus')).toBeNull()
    expect(h.root.activeElement).not.toBe(h.search)
    expect(h.selectedId()).toBe('second')
    h.search.focus()
    press(h.search, 'ArrowDown')
    expect(h.selectedId()).toBe('first')
  })
})
