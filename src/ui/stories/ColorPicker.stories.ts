import type { Meta, StoryObj } from '@storybook/html'
import { COLOR_PALETTE } from '../popup-template'
import '@tailwindplus/elements'

/**
 * Color picker popover component for selecting profile colors and custom initials.
 * Features: 21 color options in a grid, custom 2-character initials input
 */
const meta = {
  title: 'ChHeader/ColorPicker',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<Record<string, unknown>>

export default meta
type Story = StoryObj<typeof meta>

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
    btn.className =
      'flex shrink-0 items-center justify-center rounded-md bg-blue-500 hover:bg-blue-400 px-4 py-2.5 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer transition-colors'
    btn.title = 'Choose color'
    btn.innerHTML = `
      <span class="w-6 h-6 rounded-md" style="background-color: #6b4eff; border: 2px solid rgba(255,255,255,0.3)"></span>
      <span class="ml-2 text-sm font-semibold text-white">Pick Color</span>
    `

    // Popover element
    const popover = document.createElement('el-popover')
    popover.id = 'colorPickerPopover'
    popover.setAttribute('anchor', 'colorPickerBtn')
    popover.setAttribute('popover', '')
    popover.className =
      'w-screen max-w-max overflow-visible bg-transparent px-4 transition transition-discrete [--anchor-gap:--spacing(5)] backdrop:bg-transparent open:flex data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in'

    const popoverContent = document.createElement('div')
    popoverContent.className =
      'flex flex-col gap-3 p-4 bg-stone-800 rounded-lg border border-gray-700 shadow-xl'

    // Color grid
    const colorGrid = document.createElement('div')
    colorGrid.className = 'grid grid-cols-7 gap-3'

    const selectedColor = 'purple-700'

    COLOR_PALETTE.forEach((color) => {
      const colorBtn = document.createElement('button')
      colorBtn.type = 'button'
      colorBtn.className =
        'w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer color-option'
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
    initialsInput.className =
      'w-full rounded-md bg-white/10 px-2 py-1.5 text-center text-sm font-semibold text-white outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 uppercase'

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
        <li><strong>21 Colors:</strong> Full Tailwind color palette</li>
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

export const WithCustomInitials: Story = {
  render: () => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '100%'
    wrapper.style.minHeight = '100vh'
    wrapper.style.padding = '40px'
    wrapper.style.display = 'flex'
    wrapper.style.flexDirection = 'column'
    wrapper.style.gap = '40px'

    const container = document.createElement('div')
    container.style.position = 'relative'
    container.style.display = 'inline-block'

    const btn = document.createElement('button')
    btn.id = 'colorPickerBtn'
    btn.type = 'button'
    btn.popovertarget = 'colorPickerPopover'
    btn.className =
      'flex shrink-0 items-center justify-center rounded-md bg-purple-500 hover:bg-purple-400 px-4 py-2.5 focus:outline-2 focus:-outline-offset-2 focus:outline-purple-500 cursor-pointer transition-colors'
    btn.title = 'Choose color'
    btn.innerHTML = `
      <span class="w-6 h-6 rounded-md" style="background-color: #a855f7; border: 2px solid rgba(255,255,255,0.3)"></span>
      <span class="ml-2 text-sm font-semibold text-white">Pick Color</span>
    `

    const popover = document.createElement('el-popover')
    popover.id = 'colorPickerPopover'
    popover.setAttribute('anchor', 'colorPickerBtn')
    popover.setAttribute('popover', '')
    popover.className =
      'w-screen max-w-max overflow-visible bg-transparent px-4 transition transition-discrete [--anchor-gap:--spacing(5)] backdrop:bg-transparent open:flex data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in'

    const popoverContent = document.createElement('div')
    popoverContent.className =
      'flex flex-col gap-3 p-4 bg-stone-800 rounded-lg border border-gray-700 shadow-xl'

    const colorGrid = document.createElement('div')
    colorGrid.className = 'grid grid-cols-7 gap-3'

    const selectedColor = '#a855f7'

    COLOR_PALETTE.forEach((color) => {
      const colorBtn = document.createElement('button')
      colorBtn.type = 'button'
      colorBtn.className =
        'w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer color-option'
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

    const initialsInput = document.createElement('input')
    initialsInput.type = 'text'
    initialsInput.maxLength = 2
    initialsInput.placeholder = 'AB'
    initialsInput.value = 'XY'
    initialsInput.className =
      'w-full rounded-md bg-white/10 px-2 py-1.5 text-center text-sm font-semibold text-white outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 uppercase'

    popoverContent.appendChild(colorGrid)
    popoverContent.appendChild(initialsInput)
    popover.appendChild(popoverContent)

    container.appendChild(btn)
    container.appendChild(popover)

    const docs = document.createElement('div')
    docs.style.color = '#9aa3b2'
    docs.style.fontSize = '14px'
    docs.style.lineHeight = '1.6'
    docs.innerHTML = `
      <h2 style="color: #e6e9ef; margin-top: 0; margin-bottom: 8px; font-size: 16px; font-weight: 600;">With Custom Initials</h2>
      <p>This story shows the popover with pre-filled custom initials "XY". Users can type up to 2 characters, which will auto-convert to uppercase.</p>
      <p style="margin-bottom: 0; color: #6b7280;">Try typing different initials - they'll automatically convert to uppercase!</p>
    `

    wrapper.appendChild(container)
    wrapper.appendChild(docs)

    return wrapper
  },
}

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
    colorPickerBtn.className =
      'flex shrink-0 items-center justify-center rounded-l-md bg-white/10 hover:bg-white/20 px-3 py-1.5 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer'
    colorPickerBtn.title = 'Choose color'
    colorPickerBtn.innerHTML = `<span class="w-5 h-5 rounded-md" style="background-color: #3b82f6; border: 1px solid rgba(255,255,255,0.2)"></span>`

    const nameInput = document.createElement('input')
    nameInput.type = 'text'
    nameInput.placeholder = 'Profile name'
    nameInput.value = 'Production API'
    nameInput.className =
      'flex-1 bg-white/5 px-3 py-1.5 text-base text-white font-semibold outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500'

    const menuBtn = document.createElement('button')
    menuBtn.type = 'button'
    menuBtn.className =
      'flex shrink-0 items-center rounded-r-md bg-white/10 hover:bg-white/20 px-3 py-1.5 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer text-sm'
    menuBtn.title = 'Profile options'
    menuBtn.innerHTML = '<span class="text-xs font-bold">⋯</span>'

    nameSection.appendChild(colorPickerBtn)
    nameSection.appendChild(nameInput)
    nameSection.appendChild(menuBtn)

    // Color picker popover
    const popover = document.createElement('el-popover')
    popover.id = 'colorPickerPopover'
    popover.setAttribute('anchor', 'colorPickerBtn')
    popover.setAttribute('popover', '')
    popover.className =
      'w-screen max-w-max overflow-visible bg-transparent px-4 transition transition-discrete [--anchor-gap:--spacing(5)] backdrop:bg-transparent open:flex data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in'

    const popoverContent = document.createElement('div')
    popoverContent.className =
      'flex flex-col gap-3 p-4 bg-stone-800 rounded-lg border border-gray-700 shadow-xl'

    const colorGrid = document.createElement('div')
    colorGrid.className = 'grid grid-cols-7 gap-3'

    const selectedColor = 'blue-700'

    COLOR_PALETTE.forEach((color) => {
      const colorBtn = document.createElement('button')
      colorBtn.type = 'button'
      colorBtn.className =
        'w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer color-option'
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
    initialsInput.className =
      'w-full rounded-md bg-white/10 px-2 py-1.5 text-center text-sm font-semibold text-white outline-1 -outline-offset-1 outline-gray-600 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 uppercase'

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
    notesInput.className =
      'w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-700 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500'
    notesInput.style.minHeight = '80px'
    notesInput.style.fontFamily = 'inherit'
    notesInput.value = 'Authentication headers for production API endpoints'

    const notesSection = document.createElement('div')
    notesSection.appendChild(notesLabel)
    notesSection.appendChild(notesInput)

    // Submit button
    const submitBtn = document.createElement('button')
    submitBtn.type = 'submit'
    submitBtn.className =
      'rounded-md bg-blue-500 hover:bg-blue-400 px-4 py-2 text-white font-semibold focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 cursor-pointer transition-colors'
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
