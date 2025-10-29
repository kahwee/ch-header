/**
 * ProfileCard Component - Example of Component base class usage
 * Encapsulates profile rendering and event handling
 */

import { Component } from './component'
import { Profile } from '../../lib/types'
import { escapeHtml } from '../utils'
import { renderAvatar } from '../components/avatar'

export interface ProfileCardCallbacks {
  onSelect: (profileId: string) => void
  onDelete: (profileId: string) => void
  onDuplicate: (profileId: string) => void
}

export class ProfileCard extends Component {
  constructor(
    private profile: Profile,
    private callbacks: ProfileCardCallbacks,
    private isActive: boolean = false
  ) {
    super(`profile-card-${profile.id}`)
  }

  render(): string {
    const bgClass = this.isActive ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10'
    const borderClass = this.isActive ? 'border-blue-500' : 'border-stone-600'

    return `
      <div class="profile-card group flex items-center justify-between gap-3 p-3 rounded-lg border border-solid ${borderClass} ${bgClass} transition-colors" data-profile-id="${this.profile.id}">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          ${renderAvatar(this.profile.initials?.[0] || '?', this.profile.color)}
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium truncate">${escapeHtml(this.profile.name)}</h3>
            ${
              this.profile.notes
                ? `<p class="text-xs opacity-70 truncate">${escapeHtml(this.profile.notes)}</p>`
                : ''
            }
          </div>
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button data-action="select" class="p-2 rounded hover:bg-white/10 transition-colors" title="Select profile">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
          <button data-action="duplicate" class="p-2 rounded hover:bg-white/10 transition-colors" title="Duplicate profile">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button data-action="delete" class="p-2 rounded hover:bg-red-500/20 text-red-400 transition-colors" title="Delete profile">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    `
  }

  protected setupHandlers(): void {
    this.on('click', '[data-action="select"]', () => {
      this.callbacks.onSelect(this.profile.id)
    })

    this.on('click', '[data-action="delete"]', () => {
      this.callbacks.onDelete(this.profile.id)
    })

    this.on('click', '[data-action="duplicate"]', () => {
      this.callbacks.onDuplicate(this.profile.id)
    })
  }

  /**
   * Update profile data and re-render
   */
  updateProfile(profile: Profile, isActive: boolean): void {
    this.profile = profile
    this.isActive = isActive
    this.updateContent(this.render())
  }

  /**
   * Get the profile data this component renders
   */
  getProfile(): Profile {
    return this.profile
  }
}
