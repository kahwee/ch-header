/** Framework-free dropdown behavior shared by the extension and Storybook. */
export function setupDropdowns(root: Document = document): void {
  if (root.documentElement.dataset.dropdownsReady === 'true') return
  root.documentElement.dataset.dropdownsReady = 'true'

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const trigger = target.closest<HTMLButtonElement>('.dropdown__trigger')

    root.querySelectorAll<HTMLElement>('.dropdown__menu').forEach((menu) => {
      const owner = trigger?.closest('.dropdown')
      if (!owner?.contains(menu)) menu.hidden = true
    })

    if (!trigger) return
    const menu = trigger.closest('.dropdown')?.querySelector<HTMLElement>('.dropdown__menu')
    if (!menu) return

    const willOpen = menu.hidden
    menu.hidden = !willOpen
    trigger.setAttribute('aria-expanded', String(willOpen))
    event.stopPropagation()
  })
}
