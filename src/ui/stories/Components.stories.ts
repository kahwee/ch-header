import type { Meta, StoryObj } from '@storybook/html'
import { headerRow } from '../components/header-row'
import { profileListItem } from '../popup-template'

const meta = {
  title: 'ChHeader/Components',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const HeaderRow: Story = {
  render: () => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '600px'
    wrapper.style.padding = '20px'
    wrapper.style.background = '#0f1115'
    wrapper.innerHTML = headerRow({
      id: 'h1',
      header: 'authorization',
      value: 'Bearer token123',
      op: 'set',
      enabled: true,
    })
    return wrapper
  },
}

export const HeaderRowDisabled: Story = {
  render: () => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '600px'
    wrapper.style.padding = '20px'
    wrapper.style.background = '#0f1115'
    wrapper.innerHTML = headerRow({
      id: 'h1',
      header: 'x-custom',
      value: 'custom-value',
      op: 'set',
      enabled: false,
    })

    const item = wrapper.querySelector('.ch-header-item') as HTMLElement
    if (item) item.style.opacity = '0.6'

    return wrapper
  },
}

export const ProfileListItem: Story = {
  render: () => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '300px'
    wrapper.style.padding = '10px'
    wrapper.style.background = '#0f121a'
    wrapper.innerHTML = `<ul class="ch-list" style="list-style: none; margin: 0; padding: 0;">${profileListItem(
      {
        id: 'prod-1',
        name: 'Production',
        color: '#6b4eff',
        notes: 'Auth headers',
        enabled: true,
      },
      true
    )}</ul>`
    return wrapper
  },
}

export const ProfileListItemInactive: Story = {
  render: () => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '300px'
    wrapper.style.padding = '10px'
    wrapper.style.background = '#0f121a'
    wrapper.innerHTML = `<ul class="ch-list" style="list-style: none; margin: 0; padding: 0;">${profileListItem(
      {
        id: 'staging-1',
        name: 'Staging',
        color: '#ff9800',
        notes: 'Test environment',
        enabled: false,
      },
      false
    )}</ul>`
    return wrapper
  },
}
