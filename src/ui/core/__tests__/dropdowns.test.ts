import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { setupDropdowns } from '../dropdowns'

describe('setupDropdowns', () => {
  beforeAll(() => setupDropdowns())

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="dropdown">
        <button class="dropdown__trigger" aria-expanded="false">Options</button>
        <div class="dropdown__menu" hidden><button>Duplicate</button></div>
      </div>
    `
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('opens and closes a menu from its trigger', () => {
    const trigger = document.querySelector<HTMLButtonElement>('.dropdown__trigger')!
    const menu = document.querySelector<HTMLElement>('.dropdown__menu')!

    trigger.click()
    expect(menu.hidden).toBe(false)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    trigger.click()
    expect(menu.hidden).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('closes an open menu when clicking elsewhere', () => {
    const trigger = document.querySelector<HTMLButtonElement>('.dropdown__trigger')!
    const menu = document.querySelector<HTMLElement>('.dropdown__menu')!

    trigger.click()
    document.body.click()
    expect(menu.hidden).toBe(true)
  })
})
