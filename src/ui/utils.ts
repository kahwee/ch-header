/**
 * Utility functions for UI components
 */
import { COLOR_PALETTE } from './popup-template'

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return map[c] || c
  })
}

/**
 * Convert Tailwind color name to hex value
 */
export function tailwindToHex(tailwindColor: string): string {
  const color = COLOR_PALETTE.find((c) => c.tailwind === tailwindColor)
  return color?.hex || '#7e22ce'
}

/**
 * Convert hex color to Tailwind color name
 */
export function hexToTailwind(hex: string): string {
  const color = COLOR_PALETTE.find((c) => c.hex.toLowerCase() === hex.toLowerCase())
  return color?.tailwind || 'purple-700'
}
