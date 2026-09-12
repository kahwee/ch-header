import { getProfileColor } from './profile-colors'

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
  if (avatar) avatar.style.backgroundColor = getProfileColor(colorToken).hex
  if (initials) initials.textContent = getProfileInitial(name, customInitials)
}

export function updateColorSelection(root: ParentNode, selectedToken: string): void {
  root.querySelectorAll<HTMLElement>('.color-option').forEach((option) => {
    option.classList.toggle('selected', option.dataset.color === selectedToken)
  })
}
