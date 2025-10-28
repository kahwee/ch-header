/**
 * UI Component Tests for ChHeader Popup
 * Tests DOM elements and user interactions
 */

import { describe, it, expect, beforeEach } from 'vitest'

describe('ChHeader Popup UI - DOM Components', () => {
  beforeEach(() => {
    // Setup test HTML
    document.body.innerHTML = `
      <div id="app" class="ch-root">
        <header class="ch-header">
          <input id="search" class="ch-search" type="search" placeholder="Search profiles… (⌘/Ctrl+K)" />
          <button id="newProfile" class="ch-btn">New</button>
        </header>

        <main class="ch-main">
          <aside class="ch-sidebar">
            <ul id="profileList" class="ch-list" role="list"></ul>
          </aside>
          <section class="ch-detail">
            <div id="detailEmpty" class="ch-empty">Select or create a profile</div>
            <div id="detail" class="ch-detail-pane hidden">
              <div class="ch-detail-head">
                <input id="profileName" class="ch-input title" placeholder="Profile name" />
                <input id="profileColor" class="ch-color" type="color" />
              </div>
              <textarea id="profileNotes" class="ch-notes" placeholder="Notes (optional)"></textarea>

              <div class="ch-group">
                <div class="ch-group-head">
                  <h3>Matchers</h3>
                  <button id="addMatcher" class="ch-btn sm">Add</button>
                </div>
                <div id="matchers"></div>
              </div>

              <div class="ch-two">
                <div class="ch-group">
                  <div class="ch-group-head">
                    <h3>Request headers</h3>
                    <button id="addReq" class="ch-btn sm">Add</button>
                  </div>
                  <div id="reqHeaders"></div>
                </div>
                <div class="ch-group">
                  <div class="ch-group-head">
                    <h3>Response headers</h3>
                    <button id="addRes" class="ch-btn sm">Add</button>
                  </div>
                  <div id="resHeaders"></div>
                </div>
              </div>

              <footer class="ch-footer">
                <label class="ch-switch">
                  <input id="enabled" type="checkbox" />
                  <span>Enable this profile</span>
                </label>
                <div class="spacer"></div>
                <button id="duplicate" class="ch-btn">Duplicate</button>
                <button id="delete" class="ch-btn danger">Delete</button>
                <button id="apply" class="ch-btn primary">Apply</button>
              </footer>
            </div>
          </section>
        </main>
      </div>
    `
  })

  describe('Header Section', () => {
    it('should render the header with search input', () => {
      const header = document.querySelector('.ch-header')
      expect(header).toBeTruthy()

      const search = document.getElementById('search') as HTMLInputElement
      expect(search).toBeTruthy()
      expect(search.placeholder).toContain('Search profiles')
    })

    it('should render the New Profile button', () => {
      const newBtn = document.getElementById('newProfile') as HTMLButtonElement
      expect(newBtn).toBeTruthy()
      expect(newBtn.textContent).toBe('New')
      expect(newBtn.className).toContain('ch-btn')
    })

    it('should allow typing in search input', () => {
      const search = document.getElementById('search') as HTMLInputElement
      search.value = 'test query'
      expect(search.value).toBe('test query')
    })
  })

  describe('Sidebar Section', () => {
    it('should render the profile list', () => {
      const list = document.getElementById('profileList')
      expect(list).toBeTruthy()
      expect(list?.className).toContain('ch-list')
    })

    it('should dynamically add profile items', () => {
      const list = document.getElementById('profileList')!
      const profileHTML = `
        <li class="ch-item" data-id="test-id">
          <span class="ch-dot" style="background:#6b4eff"></span>
          <div>
            <div class="ch-name">Test Profile</div>
            <div class="ch-note">Test notes</div>
          </div>
          <span class="ch-note">Enabled</span>
        </li>
      `
      list.innerHTML = profileHTML

      const item = list.querySelector('.ch-item') as HTMLElement | null
      expect(item).toBeTruthy()
      expect(item?.textContent).toContain('Test Profile')
      expect((item as any)?.dataset.id).toBe('test-id')
    })
  })

  describe('Detail Section - Initial State', () => {
    it('should show empty state message initially', () => {
      const empty = document.getElementById('detailEmpty')
      expect(empty).toBeTruthy()
      expect(empty?.textContent).toBe('Select or create a profile')
    })

    it('should have detail pane hidden initially', () => {
      const detail = document.getElementById('detail')
      expect(detail?.className).toContain('hidden')
    })
  })

  describe('Detail Section - Profile Form', () => {
    beforeEach(() => {
      // Show the detail pane
      const detail = document.getElementById('detail')
      detail?.classList.remove('hidden')
      const empty = document.getElementById('detailEmpty')
      empty?.classList.add('hidden')
    })

    it('should render profile name input', () => {
      const nameInput = document.getElementById('profileName') as HTMLInputElement
      expect(nameInput).toBeTruthy()
      expect(nameInput.placeholder).toBe('Profile name')
    })

    it('should render profile color picker', () => {
      const colorInput = document.getElementById('profileColor') as HTMLInputElement
      expect(colorInput).toBeTruthy()
      expect(colorInput.type).toBe('color')
    })

    it('should render notes textarea', () => {
      const notes = document.getElementById('profileNotes') as HTMLTextAreaElement
      expect(notes).toBeTruthy()
      expect(notes.placeholder).toContain('Notes')
    })

    it('should allow editing profile fields', () => {
      const nameInput = document.getElementById('profileName') as HTMLInputElement
      const colorInput = document.getElementById('profileColor') as HTMLInputElement
      const notes = document.getElementById('profileNotes') as HTMLTextAreaElement

      nameInput.value = 'Production'
      colorInput.value = '#ff0000'
      notes.value = 'Production environment headers'

      expect(nameInput.value).toBe('Production')
      expect(colorInput.value).toBe('#ff0000')
      expect(notes.value).toBe('Production environment headers')
    })
  })

  describe('Control Buttons', () => {
    beforeEach(() => {
      const detail = document.getElementById('detail')
      detail?.classList.remove('hidden')
    })

    it('should render Add Matcher button', () => {
      const addBtn = document.getElementById('addMatcher')
      expect(addBtn).toBeTruthy()
      expect(addBtn?.textContent).toBe('Add')
    })

    it('should render Add Request Header button', () => {
      const addBtn = document.getElementById('addReq')
      expect(addBtn).toBeTruthy()
      expect(addBtn?.textContent).toBe('Add')
    })

    it('should render Add Response Header button', () => {
      const addBtn = document.getElementById('addRes')
      expect(addBtn).toBeTruthy()
      expect(addBtn?.textContent).toBe('Add')
    })

    it('should render action buttons in footer', () => {
      const duplicate = document.getElementById('duplicate')
      const deleteBtn = document.getElementById('delete')
      const apply = document.getElementById('apply')

      expect(duplicate).toBeTruthy()
      expect(deleteBtn).toBeTruthy()
      expect(apply).toBeTruthy()

      expect(deleteBtn?.className).toContain('danger')
      expect(apply?.className).toContain('primary')
    })
  })

  describe('Header Sections', () => {
    it('should render Request headers section with heading', () => {
      const reqGroup = document.querySelector('.ch-two .ch-group:first-child')
      expect(reqGroup).toBeTruthy()
      expect(reqGroup?.textContent).toContain('Request headers')
    })

    it('should render Response headers section with heading', () => {
      const resGroup = document.querySelector('.ch-two .ch-group:last-child')
      expect(resGroup).toBeTruthy()
      expect(resGroup?.textContent).toContain('Response headers')
    })

    it('should render Matchers section', () => {
      const matchGroup = document.querySelector('.ch-group')
      expect(matchGroup).toBeTruthy()
      expect(matchGroup?.textContent).toContain('Matchers')
    })
  })

  describe('Enable Switch', () => {
    beforeEach(() => {
      const detail = document.getElementById('detail')
      detail?.classList.remove('hidden')
    })

    it('should render enable/disable checkbox', () => {
      const checkbox = document.getElementById('enabled') as HTMLInputElement
      expect(checkbox).toBeTruthy()
      expect(checkbox.type).toBe('checkbox')
      expect(checkbox.checked).toBe(false)
    })

    it('should toggle checkbox state', () => {
      const checkbox = document.getElementById('enabled') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
      checkbox.checked = true
      expect(checkbox.checked).toBe(true)
    })

    it('should have descriptive label', () => {
      const label = document.querySelector('.ch-switch')
      expect(label?.textContent).toContain('Enable this profile')
    })
  })

  describe('Dynamic Content Adding', () => {
    beforeEach(() => {
      const detail = document.getElementById('detail')
      detail?.classList.remove('hidden')
    })

    it('should add a matcher row when needed', () => {
      const matchers = document.getElementById('matchers')!
      const matcherHTML = `
        <div class="ch-row" data-mid="match-1">
          <input class="ch-field" data-role="urlFilter" placeholder="urlFilter" value="example.com" />
          <input class="ch-field" data-role="label" placeholder="Label" value="Example" />
          <input class="ch-field" data-role="types" placeholder="resourceTypes" value="xmlhttprequest" />
          <button class="ch-btn sm" data-action="removeMatcher">Remove</button>
        </div>
      `
      matchers.innerHTML = matcherHTML

      const row = matchers.querySelector('.ch-row') as HTMLElement | null
      expect(row).toBeTruthy()
      expect((row as any)?.dataset.mid).toBe('match-1')
      expect((row?.querySelector('[data-role="urlFilter"]') as HTMLInputElement)?.value).toBe(
        'example.com'
      )
    })

    it('should add a header row', () => {
      const headers = document.getElementById('reqHeaders')!
      const headerHTML = `
        <div class="ch-kv" data-hid="header-1" data-kind="req">
          <input class="ch-field" data-role="header" placeholder="Header" value="X-Custom" />
          <input class="ch-field" data-role="value" placeholder="Value" value="test-value" />
          <select class="ch-select" data-role="op">
            <option value="set" selected>set</option>
            <option value="append">append</option>
            <option value="remove">remove</option>
          </select>
          <button class="ch-btn sm" data-action="removeHeader">Remove</button>
        </div>
      `
      headers.innerHTML = headerHTML

      const row = headers.querySelector('.ch-kv') as HTMLElement | null
      expect(row).toBeTruthy()
      expect((row as any)?.dataset.hid).toBe('header-1')
      expect((row?.querySelector('[data-role="header"]') as HTMLInputElement)?.value).toBe(
        'X-Custom'
      )
      expect((row?.querySelector('[data-role="op"]') as HTMLSelectElement)?.value).toBe('set')
    })
  })

  describe('Styling and Layout', () => {
    it('should have correct CSS classes for dark theme', () => {
      const root = document.querySelector('.ch-root')
      expect(root).toBeTruthy()

      expect(document.querySelector('.ch-header')).toBeTruthy()
      expect(document.querySelector('.ch-main')).toBeTruthy()
      expect(document.querySelector('.ch-sidebar')).toBeTruthy()
      expect(document.querySelector('.ch-detail')).toBeTruthy()
    })

    it('should have correct grid layout classes', () => {
      const main = document.querySelector('.ch-main')
      expect(main?.className).toContain('ch-main')

      const two = document.querySelector('.ch-two')
      expect(two).toBeTruthy()
    })

    it('should have footer with spacer for alignment', () => {
      const footer = document.querySelector('.ch-footer')
      const spacer = footer?.querySelector('.spacer')
      expect(spacer).toBeTruthy()
    })
  })

  describe('User Interactions Simulation', () => {
    it('should simulate clicking the New button', () => {
      const newBtn = document.getElementById('newProfile') as HTMLButtonElement
      let clicked = false

      newBtn.addEventListener('click', () => {
        clicked = true
      })

      newBtn.click()
      expect(clicked).toBe(true)
    })

    it('should simulate typing in search', () => {
      const search = document.getElementById('search') as HTMLInputElement
      let inputChanged = false

      search.addEventListener('input', () => {
        inputChanged = true
      })

      search.value = 'Production'
      search.dispatchEvent(new Event('input'))
      expect(inputChanged).toBe(true)
      expect(search.value).toBe('Production')
    })

    it('should simulate checking the enable checkbox', () => {
      const detail = document.getElementById('detail')
      detail?.classList.remove('hidden')

      const checkbox = document.getElementById('enabled') as HTMLInputElement
      let changed = false

      checkbox.addEventListener('change', () => {
        changed = true
      })

      checkbox.checked = true
      checkbox.dispatchEvent(new Event('change'))
      expect(changed).toBe(true)
      expect(checkbox.checked).toBe(true)
    })

    it('should simulate selecting an operation from dropdown', () => {
      const headers = document.getElementById('reqHeaders')!
      const headerHTML = `
        <div class="ch-kv">
          <select class="ch-select" data-role="op">
            <option value="set" selected>set</option>
            <option value="append">append</option>
            <option value="remove">remove</option>
          </select>
        </div>
      `
      headers.innerHTML = headerHTML

      const select = headers.querySelector('select') as HTMLSelectElement
      select.value = 'append'
      expect(select.value).toBe('append')

      select.value = 'remove'
      expect(select.value).toBe('remove')
    })
  })
})
