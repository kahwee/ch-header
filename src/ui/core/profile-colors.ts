/**
 * Profile colors owned by ChHeader.
 */
export const COLOR_PALETTE = [
  { name: 'Red', token: 'red', hex: '#f2b8b5', legacy: '#b91c1c' },
  { name: 'Orange', token: 'orange', hex: '#f6bc8f', legacy: '#b45309' },
  { name: 'Amber', token: 'amber', hex: '#e9c46a', legacy: '#ca8a04' },
  { name: 'Yellow', token: 'yellow', hex: '#dfcc8a', legacy: '#a16207' },
  { name: 'Lime', token: 'lime', hex: '#c4d69b', legacy: '#65a30d' },
  { name: 'Green', token: 'green', hex: '#a8dab5', legacy: '#15803d' },
  { name: 'Emerald', token: 'emerald', hex: '#8bd4bd', legacy: '#047857' },
  { name: 'Teal', token: 'teal', hex: '#8bd3cc', legacy: '#0d9488' },
  { name: 'Cyan', token: 'cyan', hex: '#8ed1e5', legacy: '#0891b2' },
  { name: 'Sky', token: 'sky', hex: '#a1c9f7', legacy: '#0369a1' },
  { name: 'Blue', token: 'blue', hex: '#a8c7fa', legacy: '#1d4ed8' },
  { name: 'Indigo', token: 'indigo', hex: '#b7bdf8', legacy: '#4f46e5' },
  { name: 'Violet', token: 'violet', hex: '#c5b5f4', legacy: '#6d28d9' },
  { name: 'Purple', token: 'purple', hex: '#d0b8ed', legacy: '#7e22ce' },
  { name: 'Fuchsia', token: 'fuchsia', hex: '#e1b6de', legacy: '#a21caf' },
  { name: 'Pink', token: 'pink', hex: '#efb8cc', legacy: '#be185d' },
  { name: 'Rose', token: 'rose', hex: '#efb9be', legacy: '#be123c' },
  { name: 'Gray', token: 'gray', hex: '#bdc1c6', legacy: '#374151' },
  { name: 'Zinc', token: 'zinc', hex: '#c2c4cc', legacy: '#3f3f46' },
  { name: 'Neutral', token: 'neutral', hex: '#cbc5c0', legacy: '#404040' },
  { name: 'Stone', token: 'stone', hex: '#c6beb6', legacy: '#44403c' },
]

export function resolveProfileColor(value: string): string {
  const entry = COLOR_PALETTE.find(
    (color) => color.token === value.replace(/-\d+$/, '') || color.legacy === value
  )
  if (entry) return entry.hex
  if (value === '#6b4eff') return '#c5b5f4'
  return /^#[0-9a-f]{6}$/i.test(value) ? value : '#a8c7fa'
}

export function profileColorInk(hex: string): string {
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  return luminance > 0.179 ? '#202124' : '#ffffff'
}

export interface ProfileColor {
  name: string
  token: string
  hex: string
}
export const PROFILE_COLORS: readonly ProfileColor[] = COLOR_PALETTE
export const DEFAULT_PROFILE_COLOR = 'blue'

export function getProfileColor(value = DEFAULT_PROFILE_COLOR): ProfileColor {
  const hex = resolveProfileColor(value)
  return PROFILE_COLORS.find((color) => color.hex === hex) ?? { name: 'Custom', token: value, hex }
}
