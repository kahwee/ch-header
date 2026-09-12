import { describe, expect, it } from 'vitest'
import { COLOR_PALETTE, profileColorInk, resolveProfileColor } from '../profile-colors'

describe('profile colors', () => {
  it('renders saved tokens and legacy hex colors with the same palette color', () => {
    for (const color of COLOR_PALETTE) {
      expect(resolveProfileColor(color.token)).toBe(resolveProfileColor(color.legacy))
      expect(resolveProfileColor(`${color.token}-${700}`)).toBe(color.hex)
    }
    expect(resolveProfileColor('#6b4eff')).toBe(resolveProfileColor('violet'))
  })
  it('preserves custom hex colors and rejects invalid CSS values', () => {
    expect(resolveProfileColor('#123456')).toBe('#123456')
    expect(resolveProfileColor('red;position:fixed')).toBe(resolveProfileColor('blue'))
  })
  it('uses legible initials on light palette colors and dark custom colors', () => {
    for (const color of COLOR_PALETTE) expect(profileColorInk(color.hex)).toBe('#202124')
    expect(profileColorInk('#123456')).toBe('#ffffff')
  })
})
