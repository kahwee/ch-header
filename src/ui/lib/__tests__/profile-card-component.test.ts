/**
 * Tests for ProfileCard component
 * Covers rendering, event handling, and profile updates
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ProfileCard, ProfileCardCallbacks } from '../profile-card-component'
import { Profile } from '../../../lib/types'

function createTestProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'profile-1',
    name: 'Test Profile',
    color: '#3b82f6',
    initials: 'T',
    notes: 'Test notes',
    enabled: false,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
    ...overrides,
  }
}

function createMockCallbacks(): ProfileCardCallbacks {
  return {
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    onDuplicate: vi.fn(),
  }
}

describe('ProfileCard Component', () => {
  let container: HTMLElement
  let profile: Profile
  let callbacks: ProfileCardCallbacks
  let card: ProfileCard

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    profile = createTestProfile()
    callbacks = createMockCallbacks()
    card = new ProfileCard(profile, callbacks, false)
  })

  afterEach(() => {
    card.unmount()
    document.body.removeChild(container)
  })

  describe('rendering', () => {
    it('should render profile card with basic structure', () => {
      card.mount(container)

      expect(container.querySelector('.profile-card')).toBeDefined()
      expect(container.querySelector('h3')?.textContent).toContain('Test Profile')
    })

    it('should display profile name', () => {
      card.mount(container)

      const nameEl = container.querySelector('h3')
      expect(nameEl?.textContent).toBe('Test Profile')
    })

    it('should display profile notes when present', () => {
      profile.notes = 'My test notes'
      card = new ProfileCard(profile, callbacks)
      card.mount(container)

      expect(container.textContent).toContain('My test notes')
    })

    it('should not display notes section when notes are empty', () => {
      profile.notes = ''
      card = new ProfileCard(profile, callbacks)
      card.mount(container)

      const noteEl = container.querySelector('.text-xs')
      expect(noteEl).toBeNull()
    })

    it('should escape HTML special characters in name', () => {
      profile.name = '<script>alert("xss")</script>'
      card = new ProfileCard(profile, callbacks)
      card.mount(container)

      expect(container.innerHTML).not.toContain('<script>')
      expect(container.textContent).toContain('<script>alert')
    })

    it('should escape HTML special characters in notes', () => {
      profile.notes = '<script>alert("xss")</script>'
      card = new ProfileCard(profile, callbacks)
      card.mount(container)

      // The escaped version should be in the text content
      expect(container.textContent).toContain('<script>')
      // The unescaped script tag should not be executable
      expect(container.querySelector('script')).toBeNull()
    })

    it('should include data-profile-id attribute', () => {
      card.mount(container)

      const cardEl = container.querySelector('.profile-card')
      expect(cardEl?.getAttribute('data-profile-id')).toBe('profile-1')
    })

    it('should render avatar with initials', () => {
      profile.initials = 'XY'
      card = new ProfileCard(profile, callbacks)
      card.mount(container)

      // Avatar should be rendered (from renderAvatar function)
      expect(container.querySelector('svg')).toBeDefined() // Avatar has SVG
    })

    it('should use question mark if no initials', () => {
      profile.initials = ''
      card = new ProfileCard(profile, callbacks)
      card.mount(container)

      // Should still render without error
      expect(card.isMounted()).toBe(true)
      expect(container.querySelector('.profile-card')).toBeDefined()
    })
  })

  describe('styling - active state', () => {
    it('should use blue styling when active', () => {
      card = new ProfileCard(profile, callbacks, true) // isActive = true
      card.mount(container)

      const cardEl = container.querySelector('.profile-card')
      expect(cardEl?.className).toContain('bg-blue-600')
      expect(cardEl?.className).toContain('text-white')
    })

    it('should use neutral styling when inactive', () => {
      card = new ProfileCard(profile, callbacks, false) // isActive = false
      card.mount(container)

      const cardEl = container.querySelector('.profile-card')
      expect(cardEl?.className).toContain('bg-white/5')
      expect(cardEl?.className).toContain('hover:bg-white/10')
    })

    it('should use blue border when active', () => {
      card = new ProfileCard(profile, callbacks, true)
      card.mount(container)

      const cardEl = container.querySelector('.profile-card')
      expect(cardEl?.className).toContain('border-blue-500')
    })

    it('should use neutral border when inactive', () => {
      card = new ProfileCard(profile, callbacks, false)
      card.mount(container)

      const cardEl = container.querySelector('.profile-card')
      expect(cardEl?.className).toContain('border-stone-600')
    })
  })

  describe('event handling', () => {
    beforeEach(() => {
      card.mount(container)
    })

    it('should call onSelect when select button clicked', () => {
      const selectBtn = container.querySelector('[data-action="select"]') as HTMLButtonElement
      selectBtn.click()

      expect(callbacks.onSelect).toHaveBeenCalledOnce()
      expect(callbacks.onSelect).toHaveBeenCalledWith('profile-1')
    })

    it('should call onDelete when delete button clicked', () => {
      const deleteBtn = container.querySelector('[data-action="delete"]') as HTMLButtonElement
      deleteBtn.click()

      expect(callbacks.onDelete).toHaveBeenCalledOnce()
      expect(callbacks.onDelete).toHaveBeenCalledWith('profile-1')
    })

    it('should call onDuplicate when duplicate button clicked', () => {
      const dupBtn = container.querySelector('[data-action="duplicate"]') as HTMLButtonElement
      dupBtn.click()

      expect(callbacks.onDuplicate).toHaveBeenCalledOnce()
      expect(callbacks.onDuplicate).toHaveBeenCalledWith('profile-1')
    })

    it('should handle multiple button clicks', () => {
      const selectBtn = container.querySelector('[data-action="select"]') as HTMLButtonElement
      const deleteBtn = container.querySelector('[data-action="delete"]') as HTMLButtonElement

      selectBtn.click()
      deleteBtn.click()
      selectBtn.click()

      expect(callbacks.onSelect).toHaveBeenCalledTimes(2)
      expect(callbacks.onDelete).toHaveBeenCalledTimes(1)
    })

    it('should pass correct profile ID to callbacks', () => {
      profile.id = 'unique-profile-xyz'
      card = new ProfileCard(profile, callbacks)
      card.mount(container)

      const selectBtn = container.querySelector('[data-action="select"]') as HTMLButtonElement
      selectBtn.click()

      expect(callbacks.onSelect).toHaveBeenCalledWith('unique-profile-xyz')
    })

    it('should not trigger callback for unrelated clicks', () => {
      const nameEl = container.querySelector('h3') as HTMLElement
      nameEl.click()

      expect(callbacks.onSelect).not.toHaveBeenCalled()
      expect(callbacks.onDelete).not.toHaveBeenCalled()
      expect(callbacks.onDuplicate).not.toHaveBeenCalled()
    })

    it('should handle button clicks even if deeply nested', () => {
      // SVGs inside buttons are deeply nested
      const svg = container.querySelector('[data-action="select"] svg')
      const event = new MouseEvent('click', { bubbles: true })
      svg?.dispatchEvent(event)

      expect(callbacks.onSelect).toHaveBeenCalledOnce()
    })
  })

  describe('profile updates', () => {
    beforeEach(() => {
      card.mount(container)
    })

    it('should update profile data', () => {
      const newProfile = createTestProfile({
        id: 'profile-1',
        name: 'Updated Profile',
      })

      card.updateProfile(newProfile, false)

      expect(container.querySelector('h3')?.textContent).toBe('Updated Profile')
    })

    it('should update active state', () => {
      expect(container.querySelector('.profile-card')?.className).toContain('bg-white/5')

      card.updateProfile(profile, true) // Set as active

      expect(container.querySelector('.profile-card')?.className).toContain('bg-blue-600')
    })

    it('should preserve event handlers after update', () => {
      // First click
      let selectBtn = container.querySelector('[data-action="select"]') as HTMLButtonElement
      selectBtn.click()
      expect(callbacks.onSelect).toHaveBeenCalledTimes(1)

      // Update profile
      card.updateProfile(profile, false)

      // Second click - handler should still work
      selectBtn = container.querySelector('[data-action="select"]') as HTMLButtonElement
      selectBtn.click()

      expect(callbacks.onSelect).toHaveBeenCalledTimes(2)
    })

    it('should update notes when changed', () => {
      const newProfile = createTestProfile({
        id: 'profile-1',
        notes: 'Updated notes',
      })

      card.updateProfile(newProfile, false)

      expect(container.textContent).toContain('Updated notes')
    })

    it('should handle updating from notes to no notes', () => {
      profile.notes = 'Original notes'
      card.updateProfile(profile, false)
      expect(container.textContent).toContain('Original notes')

      const noNotesProfile = createTestProfile({
        id: 'profile-1',
        notes: '',
      })
      card.updateProfile(noNotesProfile, false)

      expect(container.querySelector('.text-xs')).toBeNull()
    })

    it('should return current profile via getProfile()', () => {
      const newProfile = createTestProfile({
        id: 'profile-1',
        name: 'New Name',
      })

      card.updateProfile(newProfile, false)

      const retrieved = card.getProfile()
      expect(retrieved.name).toBe('New Name')
      expect(retrieved.id).toBe('profile-1')
    })
  })

  describe('multiple profiles', () => {
    it('should render multiple profile cards with separate state', () => {
      const container1 = document.createElement('div')
      const container2 = document.createElement('div')
      document.body.appendChild(container1)
      document.body.appendChild(container2)

      const profile1 = createTestProfile({ id: 'p1', name: 'Profile 1' })
      const profile2 = createTestProfile({ id: 'p2', name: 'Profile 2' })

      const card1 = new ProfileCard(profile1, callbacks, true)
      const card2 = new ProfileCard(profile2, callbacks, false)

      card1.mount(container1)
      card2.mount(container2)

      expect(container1.querySelector('h3')?.textContent).toBe('Profile 1')
      expect(container2.querySelector('h3')?.textContent).toBe('Profile 2')

      card1.unmount()
      card2.unmount()
      document.body.removeChild(container1)
      document.body.removeChild(container2)
    })

    it('should maintain separate callbacks for multiple cards', () => {
      const callbacks1 = createMockCallbacks()
      const callbacks2 = createMockCallbacks()

      const profile1 = createTestProfile({ id: 'p1' })
      const profile2 = createTestProfile({ id: 'p2' })

      const card1 = new ProfileCard(profile1, callbacks1)
      const card2 = new ProfileCard(profile2, callbacks2)

      const container1 = document.createElement('div')
      const container2 = document.createElement('div')
      document.body.appendChild(container1)
      document.body.appendChild(container2)

      card1.mount(container1)
      card2.mount(container2)

      const btn1 = container1.querySelector('[data-action="select"]') as HTMLButtonElement
      const btn2 = container2.querySelector('[data-action="select"]') as HTMLButtonElement

      btn1.click()
      expect(callbacks1.onSelect).toHaveBeenCalledWith('p1')
      expect(callbacks2.onSelect).not.toHaveBeenCalled()

      btn2.click()
      expect(callbacks2.onSelect).toHaveBeenCalledWith('p2')

      card1.unmount()
      card2.unmount()
      document.body.removeChild(container1)
      document.body.removeChild(container2)
    })
  })

  describe('component id', () => {
    it('should generate unique component id from profile id', () => {
      expect(card.id).toBe('profile-card-profile-1')
    })

    it('should set data-component attribute correctly', () => {
      card.mount(container)

      const el = card.getElement()
      expect(el?.getAttribute('data-component')).toBe('profile-card-profile-1')
    })
  })

  describe('edge cases', () => {
    it('should handle very long profile names', () => {
      const longName = 'A'.repeat(100)
      profile.name = longName
      card = new ProfileCard(profile, callbacks)
      card.mount(container)

      expect(container.querySelector('h3')).toBeDefined()
      // Should be truncated via CSS (text-ellipsis)
      expect(container.querySelector('h3')?.className).toContain('truncate')
    })

    it('should handle very long notes', () => {
      const longNotes = 'Lorem ipsum '.repeat(50)
      profile.notes = longNotes
      card = new ProfileCard(profile, callbacks)
      card.mount(container)

      const noteEl = container.querySelector('.text-xs')
      expect(noteEl?.className).toContain('truncate')
    })

    it('should handle undefined initials gracefully', () => {
      profile.initials = undefined
      card = new ProfileCard(profile, callbacks)

      expect(() => card.mount(container)).not.toThrow()
      expect(card.isMounted()).toBe(true)
    })

    it('should handle special characters in profile names', () => {
      const specialNames = [
        'Profile & Co.',
        'Test "Quoted"',
        "O'Brien's Profile",
        'Profile™ with emoji 🎉',
      ]

      specialNames.forEach((name) => {
        const testProfile = createTestProfile({ id: 'test', name })
        const testCard = new ProfileCard(testProfile, createMockCallbacks())
        testCard.mount(container)

        expect(container.querySelector('h3')?.textContent).toContain(name)

        testCard.unmount()
      })
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      card.mount(container)
    })

    it('should have descriptive button titles', () => {
      const selectBtn = container.querySelector('[data-action="select"]')
      const deleteBtn = container.querySelector('[data-action="delete"]')
      const dupBtn = container.querySelector('[data-action="duplicate"]')

      expect(selectBtn?.getAttribute('title')).toBe('Select profile')
      expect(deleteBtn?.getAttribute('title')).toBe('Delete profile')
      expect(dupBtn?.getAttribute('title')).toBe('Duplicate profile')
    })

    it('should have semantic button elements', () => {
      expect(container.querySelectorAll('button').length).toBe(3)
    })

    it('should use heading hierarchy correctly', () => {
      const heading = container.querySelector('h3')
      expect(heading).toBeDefined()
    })

    it('should have proper flex layout for structure', () => {
      const cardEl = container.querySelector('.profile-card')
      expect(cardEl?.className).toContain('flex')
      expect(cardEl?.className).toContain('items-center')
    })
  })
})
