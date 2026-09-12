export interface ProfileColor {
  name: string
  token: string
  hex: string
}

export const PROFILE_COLORS: readonly ProfileColor[] = [
  { name: 'Red', token: 'red-700', hex: '#b91c1c' },
  { name: 'Orange', token: 'orange-700', hex: '#b45309' },
  { name: 'Amber', token: 'amber-700', hex: '#ca8a04' },
  { name: 'Yellow', token: 'yellow-700', hex: '#a16207' },
  { name: 'Lime', token: 'lime-700', hex: '#65a30d' },
  { name: 'Green', token: 'green-700', hex: '#15803d' },
  { name: 'Emerald', token: 'emerald-700', hex: '#047857' },
  { name: 'Teal', token: 'teal-700', hex: '#0d9488' },
  { name: 'Cyan', token: 'cyan-700', hex: '#0891b2' },
  { name: 'Sky', token: 'sky-700', hex: '#0369a1' },
  { name: 'Blue', token: 'blue-700', hex: '#1d4ed8' },
  { name: 'Indigo', token: 'indigo-700', hex: '#4f46e5' },
  { name: 'Violet', token: 'violet-700', hex: '#6d28d9' },
  { name: 'Purple', token: 'purple-700', hex: '#7e22ce' },
  { name: 'Fuchsia', token: 'fuchsia-700', hex: '#a21caf' },
  { name: 'Pink', token: 'pink-700', hex: '#be185d' },
  { name: 'Rose', token: 'rose-700', hex: '#be123c' },
  { name: 'Gray', token: 'gray-700', hex: '#374151' },
  { name: 'Zinc', token: 'zinc-700', hex: '#3f3f46' },
  { name: 'Neutral', token: 'neutral-700', hex: '#404040' },
  { name: 'Stone', token: 'stone-700', hex: '#44403c' },
]

export const DEFAULT_PROFILE_COLOR = 'purple-700'

export function getProfileColor(token = DEFAULT_PROFILE_COLOR): ProfileColor {
  return PROFILE_COLORS.find((color) => color.token === token) ?? PROFILE_COLORS[13]
}
