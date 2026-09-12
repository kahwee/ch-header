import type { Profile } from '../../lib/types'
import { exportProfileJSON, hasSensitiveValues, parseProfileJSON } from '../../lib/profile-transfer'

export interface SharingOptions {
  profiles: () => Profile[]
  current: () => Profile | null
  importProfiles: (profiles: Profile[]) => void
  notify: (message: string) => void
  clipboard?: Pick<Clipboard, 'writeText'>
  download?: (text: string, filename: string) => void
}

export function downloadJSON(text: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function setupProfileSharing(root: Document, options: SharingOptions) {
  const dialog = root.querySelector<HTMLDialogElement>('#sharingDialog')!
  const query = <T extends HTMLElement>(selector: string) => dialog.querySelector<T>(selector)!
  const editor = query<HTMLTextAreaElement>('#sharingJSON')
  const error = query<HTMLElement>('#sharingError')
  const scope = query<HTMLSelectElement>('#sharingScope')
  const hide = query<HTMLInputElement>('#sharingRedact')
  let mode: 'import' | 'export' = 'export'
  let selectedId: string | undefined
  let restoreFocus: HTMLElement | null = null
  const selected = () =>
    scope.value === 'all'
      ? options.profiles()
      : options.profiles().filter((p) => p.id === selectedId)
  function render() {
    error.textContent = ''
    query('#sharingFeedback').textContent = ''
    const importing = mode === 'import'
    query('#sharingTitle').textContent = importing ? 'Import profiles' : 'Export profiles'
    query('#sharingHelp').textContent = importing
      ? 'Paste JSON or choose a file. Profiles are added as new copies and start off.'
      : 'Copy or download JSON to share with another ChHeader user.'
    query('#sharingExportSettings').hidden = importing
    query('#sharingChooseFile').hidden = !importing
    query('#sharingImport').hidden = !importing
    query('#sharingCopy').hidden = importing
    query('#sharingDownload').hidden = importing
    editor.readOnly = !importing
    editor.setAttribute('aria-label', importing ? 'JSON to import' : 'JSON to export')
    if (!importing) {
      editor.value = exportProfileJSON(selected(), hide.checked)
      query('#sharingSensitive').hidden = !hasSensitiveValues(selected())
      query<HTMLButtonElement>('#sharingCopy').disabled = selected().length === 0
      query<HTMLButtonElement>('#sharingDownload').disabled = selected().length === 0
    }
  }
  async function copy(text: string) {
    try {
      await (options.clipboard ?? navigator.clipboard).writeText(text)
      query('#sharingFeedback').textContent = 'JSON copied.'
      return true
    } catch {
      error.textContent = 'Copy was unavailable. Select the JSON and copy it with your keyboard.'
      editor.focus()
      editor.select()
      return false
    }
  }
  function open(next: 'import' | 'export', id?: string, all = false) {
    mode = next
    selectedId = id ?? options.current()?.id
    scope.value = all || !selectedId ? 'all' : 'selected'
    scope.querySelector<HTMLOptionElement>('option[value="selected"]')!.disabled = !selectedId
    hide.checked = true
    editor.value = ''
    restoreFocus = root.activeElement as HTMLElement | null
    render()
    if (!dialog.open) dialog.showModal()
    if (mode === 'import') editor.focus()
  }
  query('#sharingClose').addEventListener('click', () => dialog.close())
  dialog.addEventListener('close', () => {
    if (restoreFocus?.isConnected) restoreFocus.focus()
  })
  scope.addEventListener('change', render)
  hide.addEventListener('change', render)
  query('#sharingCopy').addEventListener('click', () => void copy(editor.value))
  query('#sharingDownload').addEventListener('click', () => {
    const name =
      scope.value === 'all'
        ? 'chheader-profiles'
        : (selected()[0]?.name || 'profile').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80)
    ;(options.download ?? downloadJSON)(editor.value, `${name}.json`)
    query('#sharingFeedback').textContent = 'JSON downloaded.'
  })
  query('#sharingImport').addEventListener('click', () => {
    try {
      const profiles = parseProfileJSON(editor.value)
      options.importProfiles(profiles)
      dialog.close()
      options.notify(
        `Imported ${profiles.length} profile${profiles.length === 1 ? '' : 's'}. All are off.`
      )
    } catch (err) {
      error.textContent = err instanceof Error ? err.message : 'Could not import profiles.'
    }
  })
  const input = query<HTMLInputElement>('#sharingFile')
  query('#sharingChooseFile').addEventListener('click', () => input.click())
  input.addEventListener('change', async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      if (file.size > 1_000_000) throw new Error('Choose a JSON file smaller than 1 MB.')
      editor.value = await file.text()
      error.textContent = ''
      editor.focus()
    } catch (err) {
      error.textContent = err instanceof Error ? err.message : 'Could not read this file.'
    }
    input.value = ''
  })
  return {
    open,
    copyProfile: async (id: string) => {
      const profile = options.profiles().find((p) => p.id === id)
      if (!profile) return
      const text = exportProfileJSON([profile])
      try {
        await (options.clipboard ?? navigator.clipboard).writeText(text)
        options.notify(
          hasSensitiveValues([profile])
            ? 'JSON copied. Sensitive values are blank.'
            : 'JSON copied.'
        )
      } catch {
        open('export', id)
        error.textContent = 'Select the JSON and copy it with your keyboard.'
        editor.focus()
        editor.select()
      }
    },
  }
}
