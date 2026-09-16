import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Profile, State } from '../../../lib/types'
import { PopupController } from '../controller'
import { getPopupTemplate, profileListItem } from '../popup-template'
import { setupProfileContextMenu } from '../profile-context-menu'
import { setupProfileSharing } from '../profile-sharing'

afterEach(() => vi.unstubAllGlobals())

function fixture() {
  vi.stubGlobal('chrome', { storage: { local: { set: vi.fn() } }, runtime: {} })
  const root = document.implementation.createHTMLDocument()
  root.body.innerHTML = getPopupTemplate()
  const profiles: Profile[] = ['First', 'Second'].map((name, i) => ({
    id: `${i}`,
    name,
    enabled: i === 0,
    color: 'blue',
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  }))
  const state: State = { profiles, current: profiles[0], activeId: '0', filtered: profiles }
  const renderList = () => {
    root.querySelector('#profileList')!.innerHTML = state.profiles
      .map((p) => profileListItem(p, p.id === state.current?.id))
      .join('')
  }
  const select = (id: string | null) => {
    state.current = state.profiles.find((p) => p.id === id) ?? null
  }
  const controller = new PopupController(state, {
    commit: renderList,
    renderList,
    select,
  })
  renderList()
  return { root, state, controller }
}

describe('profile workflows using the real template', () => {
  it('right click deletes the invoked profile, preserves selection and supports Undo', () => {
    const { root, state, controller } = fixture()
    setupProfileContextMenu(
      root,
      (id) => state.profiles.find((p) => p.id === id),
      (action, id) => {
        if (action === 'delete') controller.onDeleteProfile(id)
      }
    )
    root
      .querySelector('[data-id="1"]')!
      .dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    ;(root.querySelector('[data-profile-action="delete"]') as HTMLButtonElement).click()
    expect(state.profiles.map((p) => p.name)).toEqual(['First'])
    expect(state.current?.id).toBe('0')
    controller.onUndoDeleteProfile()
    expect(state.profiles[1].name).toBe('Second')
    expect(state.profiles[1].enabled).toBe(false)
  })
  it('opens from the keyboard and closes on Escape', () => {
    const { root, state } = fixture()
    setupProfileContextMenu(root, (id) => state.profiles.find((p) => p.id === id), vi.fn())
    root
      .querySelector('[data-id="1"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true }))
    const menu = root.querySelector<HTMLElement>('#profileContextMenu')!
    expect(menu.hidden).toBe(false)
    menu
      .querySelector('button')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(menu.hidden).toBe(true)
  })
  it('shows explicit status and keeps exactly one profile on when switching', () => {
    const { root, state, controller } = fixture()
    controller.onSetProfileEnabled('1', true)
    expect(state.profiles.map((p) => p.enabled)).toEqual([false, true])
    expect(root.querySelector('#status-0')?.textContent).toBe('Off')
    expect(root.querySelector('#status-1')?.textContent).toBe('On')
    controller.onDeleteProfile('1')
    expect(state.activeId).toBe(null)
    expect(state.profiles[0].enabled).toBe(false)
  })
  it('imports pasted JSON atomically and exports selected or all profiles', async () => {
    const { root, state, controller } = fixture()
    const dialog = root.querySelector<HTMLDialogElement>('#sharingDialog')!
    dialog.showModal = () => {
      dialog.open = true
    }
    dialog.close = () => {
      dialog.open = false
    }
    const writeText = vi.fn().mockResolvedValue(undefined)
    const sharing = setupProfileSharing(root, {
      profiles: () => state.profiles,
      current: () => state.current,
      importProfiles: (profiles) => controller.onImportProfiles(profiles),
      notify: vi.fn(),
      clipboard: { writeText },
    })
    sharing.open('import')
    const editor = root.querySelector<HTMLTextAreaElement>('#sharingJSON')!
    editor.value = '{'
    root.querySelector<HTMLButtonElement>('#sharingImport')!.click()
    expect(state.profiles).toHaveLength(2)
    expect(dialog.open).toBe(true)
    expect(root.querySelector('#sharingError')!.textContent).toContain('Invalid JSON')
    editor.value = JSON.stringify({ name: 'Shared', enabled: true })
    root.querySelector<HTMLButtonElement>('#sharingImport')!.click()
    expect(state.profiles).toHaveLength(3)
    expect(state.profiles[0].enabled).toBe(false)
    expect(dialog.open).toBe(false)
    sharing.open('export', '0')
    root.querySelector<HTMLButtonElement>('#sharingCopy')!.click()
    await Promise.resolve()
    expect(JSON.parse(writeText.mock.calls[0][0]).profiles).toHaveLength(1)
    sharing.open('export', undefined, true)
    expect(JSON.parse(editor.value).profiles).toHaveLength(3)
  })
})
