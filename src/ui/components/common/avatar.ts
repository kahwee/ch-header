/**
 * Avatar component for profile display
 */
import { escapeHtml } from '../../core/utils'

export function renderAvatar(character: string, backgroundColor: string): string {
  return `<div class="profile-avatar" style="background-color: ${backgroundColor}">
    <span>${escapeHtml(character)}</span>
  </div>`
}
