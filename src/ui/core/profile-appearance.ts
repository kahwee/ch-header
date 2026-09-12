import { getProfileColor, profileColorInk } from './profile-colors'

export function getProfileInitial(name: string, customInitials?: string): string {
  return (
    customInitials?.trim().slice(0, 1) ||
    name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 1) ||
    '?'
  )
}

export function renderProfileAppearance(
  avatar: HTMLElement | null,
  initials: HTMLElement | null,
  name: string,
  customInitials: string | undefined,
  colorToken: string
): void {
  if (avatar) {
    const color = getProfileColor(colorToken).hex
    avatar.style.backgroundColor = color
    avatar.style.color = profileColorInk(color)
  }
  if (initials) initials.textContent = getProfileInitial(name, customInitials)
}

export function updateColorSelection(root: ParentNode, selectedToken: string): void {
  root.querySelectorAll<HTMLElement>('.color-option').forEach((option) => {
    const selected =
      getProfileColor(option.dataset.color).hex === getProfileColor(selectedToken).hex
    option.classList.toggle('selected', selected)
    option.setAttribute('aria-pressed', String(selected))
  })
}
