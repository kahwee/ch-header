import { describe, expect, it, vi } from 'vitest'
import { createPopupHarness, localProfile } from '../../../test/popup-harness'

const headerJSON = JSON.stringify({ header: 'Authorization', value: 'demo-import-only' })

function pendingFile() {
  let resolve!: (text: string) => void
  const promise = new Promise<string>((finish) => {
    resolve = finish
  })
  const file = new File([], 'headers.json', { type: 'application/json' })
  const text = vi.fn(() => promise)
  Object.defineProperty(file, 'text', { value: text })
  return { file, text, promise, resolve }
}

function chooseFile(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, 'files', { configurable: true, value: [file] })
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('header file imports through the production popup', () => {
  it('does not add credentials to a different active profile after a delayed read', async () => {
    const h = await createPopupHarness([
      localProfile(),
      localProfile({
        id: 'second',
        name: 'Other destination',
        accessSites: ['localhost'],
        matchers: [{ id: 'other', urlFilter: 'localhost:3002' }],
      }),
    ])
    const pending = pendingFile()
    chooseFile(h.query('#importFile'), pending.file)
    h.click('a[data-id="second"]')
    h.click('#enabled')
    await h.chrome.settle()
    const before = h.chrome.snapshot().profiles
    const rules = h.chrome.rules()

    pending.resolve(headerJSON)
    await pending.promise
    await h.chrome.settle()

    expect(h.chrome.rules()).toEqual(rules)
    expect(h.chrome.snapshot().profiles).toEqual(before)
    expect(h.query('#profileNotice').textContent).toContain('Profile changed')
  })

  it('does not redirect an import to the next profile after its target is deleted', async () => {
    const h = await createPopupHarness([
      localProfile(),
      localProfile({ id: 'second', name: 'Second' }),
    ])
    const pending = pendingFile()
    chooseFile(h.query('#importFile'), pending.file)
    h.click('[data-action="delete"]')
    await h.chrome.settle()
    const before = h.chrome.snapshot().profiles

    pending.resolve(headerJSON)
    await pending.promise
    await h.chrome.settle()

    expect(h.chrome.snapshot().profiles).toEqual(before)
    expect(h.query('#profileNotice').textContent).toContain('Profile changed')
  })

  it('keeps importing into the selected profile when its identity is unchanged', async () => {
    const h = await createPopupHarness()
    const pending = pendingFile()
    chooseFile(h.query('#importFile'), pending.file)
    h.input('#profileName', 'Renamed while reading')
    pending.resolve(headerJSON)
    await pending.promise
    await h.chrome.settle()

    expect(h.chrome.snapshot().profiles).toEqual([
      expect.objectContaining({
        id: 'local',
        name: 'Renamed while reading',
        requestHeaders: expect.arrayContaining([
          expect.objectContaining({ header: 'Authorization', value: 'demo-import-only' }),
        ]),
      }),
    ])
    expect(h.chrome.rules()).toEqual([])
    expect(h.query('#profileNotice').textContent).toContain('Imported 1 header')
  })

  it('rejects oversized files before loading their contents into memory', async () => {
    const h = await createPopupHarness()
    const file = new File([], 'oversized.json')
    Object.defineProperty(file, 'size', { value: 1_000_001 })
    const text = vi.fn().mockResolvedValue(headerJSON)
    Object.defineProperty(file, 'text', { value: text })
    const before = h.chrome.snapshot().profiles

    chooseFile(h.query('#importFile'), file)
    await h.chrome.settle()

    expect(text).not.toHaveBeenCalled()
    expect(h.chrome.snapshot().profiles).toEqual(before)
    expect(h.query('#profileNotice').textContent).toContain('smaller than 1 MB')
  })
})

describe('profile file reads in the sharing dialog', () => {
  async function sharingHarness() {
    const h = await createPopupHarness([
      localProfile({
        requestHeaders: [{ id: 'credential', header: 'Authorization', value: 'demo-stored-only' }],
      }),
    ])
    const dialog = h.query<HTMLDialogElement>('#sharingDialog')
    dialog.showModal = () => {
      dialog.open = true
    }
    dialog.close = () => {
      dialog.open = false
      dialog.dispatchEvent(new Event('close'))
    }
    h.click('[data-action="importProfile"]')
    return h
  }

  it('does not replace a redacted export with a pending import file', async () => {
    const h = await sharingHarness()
    const pending = pendingFile()
    chooseFile(h.query('#sharingFile'), pending.file)
    h.click('#sharingClose')
    h.click('[data-action="exportAll"]')
    const editor = h.query<HTMLTextAreaElement>('#sharingJSON')
    const exported = editor.value

    pending.resolve(
      JSON.stringify({ name: 'Private import', requestHeaders: [JSON.parse(headerJSON)] })
    )
    await pending.promise

    expect(editor.readOnly).toBe(true)
    expect(h.query('#sharingSensitive').hidden).toBe(false)
    expect(h.query<HTMLInputElement>('#sharingRedact').checked).toBe(true)
    expect(editor.value).toBe(exported)
    expect(editor.value).not.toContain('demo-import-only')
  })

  it('preserves newer pasted JSON when an earlier file read completes', async () => {
    const h = await sharingHarness()
    const pending = pendingFile()
    chooseFile(h.query('#sharingFile'), pending.file)
    const newer = JSON.stringify({ name: 'Newer pasted profile' })
    h.input('#sharingJSON', newer)

    pending.resolve(JSON.stringify({ name: 'Earlier file profile' }))
    await pending.promise

    expect(h.query<HTMLTextAreaElement>('#sharingJSON').value).toBe(newer)
  })

  it('loads the chosen file when the same import dialog is still open', async () => {
    const h = await sharingHarness()
    const pending = pendingFile()
    chooseFile(h.query('#sharingFile'), pending.file)
    const text = JSON.stringify({ name: 'Chosen file profile' })

    pending.resolve(text)
    await pending.promise
    h.click('#sharingImport')
    await h.chrome.settle()

    expect(h.chrome.snapshot().profiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Chosen file profile', enabled: false }),
      ])
    )
  })
})
