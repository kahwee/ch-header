export interface ProfileKeyboardNavigation {
  reset(): void
}

interface NavigationOptions {
  search: HTMLInputElement
  getItems: () => HTMLElement[]
  onSelect: (id: string) => void
}

export function setupProfileKeyboardNavigation({
  search,
  getItems,
  onSelect,
}: NavigationOptions): ProfileKeyboardNavigation {
  let selectedIndex = -1

  const reset = () => {
    selectedIndex = -1
    getItems().forEach((item) => {
      item.classList.remove('keyboard-focus')
    })
  }

  const highlight = (items: HTMLElement[]) => {
    items.forEach((item, index) => {
      item.classList.toggle('keyboard-focus', index === selectedIndex)
    })
    const selected = items[selectedIndex]
    if (!selected) return

    selected.scrollIntoView({ block: 'nearest' })
    if (selected.dataset.id) onSelect(selected.dataset.id)
  }

  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      search.focus()
      return
    }

    if (event.target !== search) return
    const items = getItems()
    if (items.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1)
      highlight(items)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      selectedIndex = Math.max(selectedIndex - 1, 0)
      highlight(items)
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      event.preventDefault()
      const id = items[selectedIndex]?.dataset.id
      if (id) onSelect(id)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      reset()
      search.blur()
    }
  })

  return { reset }
}
