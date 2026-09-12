/** Framework-free dropdown behavior shared by the extension and Storybook. */
export function setupDropdowns(root: Document = document): void {
  if (root.documentElement.dataset.dropdownsReady === 'true') return
  root.documentElement.dataset.dropdownsReady = 'true'

  function close(menu: HTMLElement, restoreFocus = false) {
    menu.hidden = true
    const trigger = menu
      .closest('.dropdown')
      ?.querySelector<HTMLButtonElement>('.dropdown__trigger')
    trigger?.setAttribute('aria-expanded', 'false')
    if (restoreFocus) trigger?.focus()
  }

  root.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>('.dropdown__trigger')
    const menu = trigger?.closest('.dropdown')?.querySelector<HTMLElement>('.dropdown__menu')
    root.querySelectorAll<HTMLElement>('.dropdown__menu').forEach((other) => {
      if (other !== menu) close(other)
    })
    if (!trigger || !menu) return
    menu.hidden = !menu.hidden
    trigger.setAttribute('aria-expanded', String(!menu.hidden))
    event.stopPropagation()
  })

  root.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement
    const owner = target.closest('.dropdown')
    const menu = owner?.querySelector<HTMLElement>('.dropdown__menu')
    const trigger = owner?.querySelector<HTMLButtonElement>('.dropdown__trigger')
    if (!menu || !trigger) return
    if (event.key === 'Escape' && !menu.hidden) {
      event.preventDefault()
      event.stopPropagation()
      close(menu, true)
    } else if (event.key === 'Tab') {
      close(menu)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      root.querySelectorAll<HTMLElement>('.dropdown__menu').forEach((other) => {
        if (other !== menu) close(other)
      })
      menu.hidden = false
      trigger.setAttribute('aria-expanded', 'true')
      const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
      const current = items.indexOf(target as HTMLButtonElement)
      const next =
        current < 0
          ? event.key === 'ArrowDown'
            ? 0
            : items.length - 1
          : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items[next]?.focus()
    }
  })
}
