import type { Meta, StoryObj } from '@storybook/html'
import { COLOR_PALETTE } from '../../core/popup-template'

/**
 * Color Picker Component
 *
 * Interactive popover for selecting profile colors from a 21-color palette
 * and optionally setting custom 2-character initials for the profile avatar.
 */
const meta = {
  title: 'ChHeader/Components/Color Picker',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A popover component that displays a curated grid of 21 profile colors and an optional initials input.',
      },
    },
  },
} satisfies Meta<Record<string, unknown>>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Color picker popover with 21 color options and initials input.
 * Click the button to open the popover and explore the interactive color grid.
 */
export const Default: Story = {
  render: () => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '100%'
    wrapper.style.minHeight = '100vh'
    wrapper.style.padding = '40px'
    wrapper.style.display = 'flex'
    wrapper.style.flexDirection = 'column'
    wrapper.style.gap = '40px'

    // Container for the button and popover
    const container = document.createElement('div')
    container.style.position = 'relative'
    container.style.display = 'inline-block'

    // Color picker button
    const btn = document.createElement('button')
    btn.id = 'colorPickerBtn'
    btn.type = 'button'
    btn.popovertarget = 'colorPickerPopover'
    btn.className = 'button button--primary button--md'
    btn.title = 'Choose color'
    btn.innerHTML = `
      <span class="button__icon" style="background-color: #6b4eff; border-radius: 4px"></span>
      <span>Pick Color</span>
    `

    // Popover element
    const popover = document.createElement('div')
    popover.id = 'colorPickerPopover'
    popover.setAttribute('anchor', 'colorPickerBtn')
    popover.setAttribute('popover', '')
    popover.className = 'color-popover'

    const popoverContent = document.createElement('div')
    popoverContent.className = 'color-popover__content'

    // Color grid
    const colorGrid = document.createElement('div')
    colorGrid.className = 'color-grid'

    const selectedColor = 'purple'

    COLOR_PALETTE.forEach((color) => {
      const colorBtn = document.createElement('button')
      colorBtn.type = 'button'
      colorBtn.className = 'color-option'
      colorBtn.title = color.name
      colorBtn.setAttribute('data-color', color.hex)
      colorBtn.setAttribute('popovertarget', 'colorPickerPopover')
      colorBtn.setAttribute('popovertargetaction', 'hide')

      // Highlight selected color
      if (color.hex === selectedColor) {
        colorBtn.style.backgroundColor = color.hex
        colorBtn.style.border = '3px solid white'
      } else {
        colorBtn.style.backgroundColor = color.hex
        colorBtn.style.border = '2px solid rgba(255,255,255,0.2)'
      }

      // Click handler to update the button color and indicator
      colorBtn.addEventListener('click', () => {
        const preview = btn.querySelector('span') as HTMLElement
        if (preview) {
          preview.style.backgroundColor = color.hex
        }
        // Update all color buttons' borders
        const allColorBtns = popover.querySelectorAll('.color-option')
        allColorBtns.forEach((c) => {
          const cHex = c.getAttribute('data-color')
          if (cHex === color.hex) {
            ;(c as HTMLElement).style.border = '3px solid white'
          } else {
            ;(c as HTMLElement).style.border = '2px solid rgba(255,255,255,0.2)'
          }
        })
      })

      colorGrid.appendChild(colorBtn)
    })

    // Initials input
    const initialsInput = document.createElement('input')
    initialsInput.type = 'text'
    initialsInput.maxLength = 2
    initialsInput.placeholder = 'AB'
    initialsInput.className = 'field field--initials'

    popoverContent.appendChild(colorGrid)
    popoverContent.appendChild(initialsInput)
    popover.appendChild(popoverContent)

    container.appendChild(btn)
    container.appendChild(popover)

    // Add some documentation
    const docs = document.createElement('div')
    docs.style.color = '#9aa3b2'
    docs.style.fontSize = '14px'
    docs.style.lineHeight = '1.6'
    docs.innerHTML = `
      <h2 style="color: #e6e9ef; margin-top: 0; margin-bottom: 8px; font-size: 16px; font-weight: 600;">Color Picker Features</h2>
      <ul style="margin: 0; padding-left: 20px;">
        <li><strong>21 Colors:</strong> Curated profile palette</li>
        <li><strong>Hover Effect:</strong> Colors scale up on hover</li>
        <li><strong>Custom Initials:</strong> Up to 2 characters, auto-uppercase</li>
        <li><strong>Click to Select:</strong> Colors close popover automatically</li>
        <li><strong>Anchor Positioning:</strong> Popover stays near the button</li>
      </ul>
    `

    wrapper.appendChild(container)
    wrapper.appendChild(docs)

    return wrapper
  },
}

/**
 * Color picker integrated into a full profile form.
 * Shows how the color picker works within the actual extension UI context.
 */
export const FullProfileForm: Story = {
  render: () => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '100%'
    wrapper.style.minHeight = '100vh'
    wrapper.style.padding = '40px'
    wrapper.style.backgroundColor = '#0f1115'
    wrapper.style.color = '#e6e9ef'

    const form = document.createElement('form')
    form.style.maxWidth = '500px'
    form.style.margin = '0 auto'
    form.style.display = 'flex'
    form.style.flexDirection = 'column'
    form.style.gap = '24px'

    // Title
    const title = document.createElement('h1')
    title.textContent = 'Profile Form with Color Picker'
    title.style.margin = '0 0 16px 0'
    title.style.fontSize = '24px'
    title.style.fontWeight = '600'

    // Profile name input (left) + color picker + menu button (right)
    const nameSection = document.createElement('div')
    nameSection.style.display = 'flex'
    nameSection.style.gap = '0'
    nameSection.style.alignItems = 'stretch'

    const colorPickerBtn = document.createElement('button')
    colorPickerBtn.id = 'colorPickerBtn'
    colorPickerBtn.type = 'button'
    colorPickerBtn.popovertarget = 'colorPickerPopover'
    colorPickerBtn.className = 'profile-avatar profile-avatar--button'
    colorPickerBtn.title = 'Choose color'
    colorPickerBtn.innerHTML = `<span style="background-color: #3b82f6">P</span>`

    const nameInput = document.createElement('input')
    nameInput.type = 'text'
    nameInput.placeholder = 'Profile name'
    nameInput.value = 'Production API'
    nameInput.className = 'field field--profile-name'

    const menuBtn = document.createElement('button')
    menuBtn.type = 'button'
    menuBtn.className = 'icon-button'
    menuBtn.title = 'Profile options'
    menuBtn.textContent = '⋯'

    nameSection.appendChild(colorPickerBtn)
    nameSection.appendChild(nameInput)
    nameSection.appendChild(menuBtn)

    // Color picker popover
    const popover = document.createElement('div')
    popover.id = 'colorPickerPopover'
    popover.setAttribute('anchor', 'colorPickerBtn')
    popover.setAttribute('popover', '')
    popover.className = 'color-popover'

    const popoverContent = document.createElement('div')
    popoverContent.className = 'color-popover__content'

    const colorGrid = document.createElement('div')
    colorGrid.className = 'color-grid'

    const selectedColor = 'blue'

    COLOR_PALETTE.forEach((color) => {
      const colorBtn = document.createElement('button')
      colorBtn.type = 'button'
      colorBtn.className = 'color-option'
      colorBtn.title = color.name
      colorBtn.setAttribute('data-color', color.hex)
      colorBtn.setAttribute('popovertarget', 'colorPickerPopover')
      colorBtn.setAttribute('popovertargetaction', 'hide')

      // Highlight selected color
      if (color.hex === selectedColor) {
        colorBtn.style.backgroundColor = color.hex
        colorBtn.style.border = '3px solid white'
      } else {
        colorBtn.style.backgroundColor = color.hex
        colorBtn.style.border = '2px solid rgba(255,255,255,0.2)'
      }

      colorBtn.addEventListener('click', () => {
        const preview = colorPickerBtn.querySelector('span') as HTMLElement
        if (preview) {
          preview.style.backgroundColor = color.hex
        }
        // Update all color buttons' borders
        const allColorBtns = popover.querySelectorAll('.color-option')
        allColorBtns.forEach((c) => {
          const cHex = c.getAttribute('data-color')
          if (cHex === color.hex) {
            ;(c as HTMLElement).style.border = '3px solid white'
          } else {
            ;(c as HTMLElement).style.border = '2px solid rgba(255,255,255,0.2)'
          }
        })
      })

      colorGrid.appendChild(colorBtn)
    })

    const initialsInput = document.createElement('input')
    initialsInput.type = 'text'
    initialsInput.maxLength = 2
    initialsInput.placeholder = 'AB'
    initialsInput.value = 'PA'
    initialsInput.className = 'field field--initials'

    popoverContent.appendChild(colorGrid)
    popoverContent.appendChild(initialsInput)
    popover.appendChild(popoverContent)

    // Notes
    const notesLabel = document.createElement('label')
    notesLabel.style.display = 'block'
    notesLabel.style.fontSize = '14px'
    notesLabel.style.color = '#9aa3b2'
    notesLabel.style.marginBottom = '8px'
    notesLabel.textContent = 'Notes'

    const notesInput = document.createElement('textarea')
    notesInput.placeholder = 'Add notes about this profile...'
    notesInput.className = 'field field--notes'
    notesInput.style.minHeight = '80px'
    notesInput.style.fontFamily = 'inherit'
    notesInput.value = 'Authentication headers for production API endpoints'

    const notesSection = document.createElement('div')
    notesSection.appendChild(notesLabel)
    notesSection.appendChild(notesInput)

    // Submit button
    const submitBtn = document.createElement('button')
    submitBtn.type = 'submit'
    submitBtn.className = 'button button--primary button--md'
    submitBtn.textContent = 'Save Profile'

    form.appendChild(title)
    form.appendChild(nameSection)
    form.appendChild(popover)
    form.appendChild(notesSection)
    form.appendChild(submitBtn)

    wrapper.appendChild(form)

    return wrapper
  },
}
