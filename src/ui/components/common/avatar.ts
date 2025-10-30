/**
 * Avatar component for profile display
 */
import { escapeHtml } from '../../core/utils'

export function renderAvatar(character: string, backgroundColor: string): string {
  return `<div class="flex size-8 flex-none items-center justify-center rounded-md font-semibold text-white text-sm font-mono" style="background-color: ${backgroundColor}">
    <span style="text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${escapeHtml(character)}</span>
  </div>`
}
