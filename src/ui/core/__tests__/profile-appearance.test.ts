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

    renderProfileAppearance(avatar, initials, 'Production', undefined, 'blue-700')

    expect(initials.textContent).toBe('P')
    expect(avatar.style.backgroundColor).toBe('rgb(29, 78, 216)')
  })

  it('marks only the selected color option', () => {
    document.body.innerHTML = `
      <button class="color-option" data-color="blue-700"></button>
      <button class="color-option selected" data-color="red-700"></button>
    `

    updateColorSelection(document, 'blue-700')

    expect(document.querySelector('[data-color="blue-700"]')?.classList).toContain('selected')
    expect(document.querySelector('[data-color="red-700"]')?.classList).not.toContain('selected')
  })
})
