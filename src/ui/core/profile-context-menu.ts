import type { Profile } from '../../lib/types'

export type ProfileAction = 'toggle' | 'rename' | 'duplicate' | 'copy' | 'export' | 'delete'

/** One menu for pointer and keyboard context actions, always bound to the invoked profile. */
export function setupProfileContextMenu(
  root: Document,
  find: (id: string) => Profile | undefined,
  action: (action: ProfileAction, id: string) => void
): void {
  const menu = root.querySelector<HTMLElement>('#profileContextMenu')!
  let profileId: string | undefined
  let opener: HTMLElement | undefined
  function close(restore = false) {
    menu.hidden = true
    if (restore && opener?.isConnected) opener.focus()
    profileId = undefined
  }
  function open(target: HTMLElement, x: number, y: number) {
    const row = target.closest<HTMLElement>('#profileList a[data-id]')
    const profile = row?.dataset.id ? find(row.dataset.id) : undefined
    if (!row || !profile) return false
    opener = row
    profileId = profile.id
    menu.querySelector('[data-context-name]')!.textContent = profile.name
    menu.querySelector('[data-profile-action="toggle"]')!.textContent = profile.enabled
      ? 'Turn off'
      : 'Turn on'
    menu.hidden = false
    const width = menu.offsetWidth || 200
    const height = menu.offsetHeight || 260
    menu.style.left = `${Math.max(8, Math.min(x, root.documentElement.clientWidth - width - 8))}px`
    menu.style.top = `${Math.max(8, Math.min(y, root.documentElement.clientHeight - height - 8))}px`
    menu.querySelector<HTMLButtonElement>('button')?.focus()
    return true
  }
  root.addEventListener('contextmenu', (event) => {
    if (open(event.target as HTMLElement, event.clientX, event.clientY)) event.preventDefault()
  })
  root.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement
    if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
      const bounds = target.getBoundingClientRect()
      if (open(target, bounds.left + 12, bounds.bottom)) event.preventDefault()
      return
    }
    if (menu.hidden || !menu.contains(target)) return
    const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('button'))
    const index = items.indexOf(target as HTMLButtonElement)
    if (event.key === 'Escape' || event.key === 'Tab') {
      event.preventDefault()
      event.stopPropagation()
      close(true)
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? items.length - 1
            : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items[next]?.focus()
    }
  })
  root.addEventListener('pointerdown', (event) => {
    if (!menu.hidden && !menu.contains(event.target as Node)) close()
  })
  menu.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-profile-action]')
    if (!button || !profileId) return
    const id = profileId
    const chosen = button.dataset.profileAction as ProfileAction
    close(true)
    action(chosen, id)
  })
  root.addEventListener('scroll', () => close(), true)
}
