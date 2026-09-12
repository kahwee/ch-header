/**
 * Stable profile color tokens retained for storage compatibility.
 */
export const COLOR_PALETTE = [
  { name: 'Red', token: 'red-700', hex: '#f2b8b5', legacy: '#b91c1c' },
  { name: 'Orange', token: 'orange-700', hex: '#f6bc8f', legacy: '#b45309' },
  { name: 'Amber', token: 'amber-700', hex: '#e9c46a', legacy: '#ca8a04' },
  { name: 'Yellow', token: 'yellow-700', hex: '#dfcc8a', legacy: '#a16207' },
  { name: 'Lime', token: 'lime-700', hex: '#c4d69b', legacy: '#65a30d' },
  { name: 'Green', token: 'green-700', hex: '#a8dab5', legacy: '#15803d' },
  { name: 'Emerald', token: 'emerald-700', hex: '#8bd4bd', legacy: '#047857' },
  { name: 'Teal', token: 'teal-700', hex: '#8bd3cc', legacy: '#0d9488' },
  { name: 'Cyan', token: 'cyan-700', hex: '#8ed1e5', legacy: '#0891b2' },
  { name: 'Sky', token: 'sky-700', hex: '#a1c9f7', legacy: '#0369a1' },
  { name: 'Blue', token: 'blue-700', hex: '#a8c7fa', legacy: '#1d4ed8' },
  { name: 'Indigo', token: 'indigo-700', hex: '#b7bdf8', legacy: '#4f46e5' },
  { name: 'Violet', token: 'violet-700', hex: '#c5b5f4', legacy: '#6d28d9' },
  { name: 'Purple', token: 'purple-700', hex: '#d0b8ed', legacy: '#7e22ce' },
  { name: 'Fuchsia', token: 'fuchsia-700', hex: '#e1b6de', legacy: '#a21caf' },
  { name: 'Pink', token: 'pink-700', hex: '#efb8cc', legacy: '#be185d' },
  { name: 'Rose', token: 'rose-700', hex: '#efb9be', legacy: '#be123c' },
  { name: 'Gray', token: 'gray-700', hex: '#bdc1c6', legacy: '#374151' },
  { name: 'Zinc', token: 'zinc-700', hex: '#c2c4cc', legacy: '#3f3f46' },
  { name: 'Neutral', token: 'neutral-700', hex: '#cbc5c0', legacy: '#404040' },
  { name: 'Stone', token: 'stone-700', hex: '#c6beb6', legacy: '#44403c' },
]

export function resolveProfileColor(value: string): string {
  const entry = COLOR_PALETTE.find((color) => color.token === value || color.legacy === value)
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
