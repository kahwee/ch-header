import { describe, expect, it } from 'vitest'
import {
  getProfileInitial,
  renderProfileAppearance,
  updateColorSelection,
} from '../profile-appearance'

describe('profile appearance', () => {
  it('prefers a custom initial and falls back to the profile name', () => {
    expect(getProfileInitial('Production API', 'X')).toBe('X')
    expect(getProfileInitial('Production API')).toBe('P')
    expect(getProfileInitial('')).toBe('?')
  })

  it('updates avatar content and color', () => {
    const avatar = document.createElement('button')
    const initials = document.createElement('span')

    renderProfileAppearance(avatar, initials, 'Production', undefined, 'blue')

    expect(initials.textContent).toBe('P')
    expect(avatar.style.backgroundColor).toBe('rgb(168, 199, 250)')
  })

  it('marks only the selected color option', () => {
    document.body.innerHTML = `
      <button class="color-option" data-color="blue"></button>
      <button class="color-option selected" data-color="red"></button>
    `

    updateColorSelection(document, 'blue')

    expect(document.querySelector('[data-color="blue"]')?.classList).toContain('selected')
    expect(document.querySelector('[data-color="red"]')?.classList).not.toContain('selected')
  })
})
