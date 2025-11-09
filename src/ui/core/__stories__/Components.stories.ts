import type { Meta, StoryObj } from '@storybook/html'
import { headerRow } from '../../components/headers/header-row'
import { profileListItem } from '../popup-template'
import '../../components/common/checkbox-element'

/**
 * Header Row Component
 *
 * Table row for editing HTTP request/response headers with inline controls.
 */
const headerMeta = {
  title: 'ChHeader/Components/Header Row',
  render: (args: { id: string; header: string; value: string; op: 'set'; enabled: boolean }) => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '600px'
    wrapper.style.padding = '20px'
    wrapper.style.background = '#0f1115'

    const table = document.createElement('table')
    table.className = 'min-w-full'

    const tbody = document.createElement('tbody')
    tbody.innerHTML = headerRow(args)

    table.appendChild(tbody)
    wrapper.appendChild(table)
    return wrapper
  },
  argTypes: {
    header: {
      control: 'text',
      description: 'HTTP header name',
    },
    value: {
      control: 'text',
      description: 'Header value',
    },
    enabled: {
      control: 'boolean',
      description: 'Whether header is active',
    },
  },
  args: {
    id: 'h1',
    header: 'authorization',
    value: 'Bearer token123',
    op: 'set' as const,
    enabled: true,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<{ id: string; header: string; value: string; op: 'set'; enabled: boolean }>

export default headerMeta
type HeaderStory = StoryObj<typeof headerMeta>

/**
 * Header row in enabled state
 */
export const HeaderRow: HeaderStory = {}

/**
 * Header row in disabled state
 */
export const HeaderRowDisabled: HeaderStory = {
  args: {
    header: 'x-custom-header',
    value: 'custom-value',
    enabled: false,
  },
}

/**
 * Profile List Item Component
 *
 * Individual profile list item for the sidebar navigation.
 */
const profileMeta = {
  title: 'ChHeader/Components/Profile List Item',
  render: (args: {
    profile: { id: string; name: string; color: string; notes: string; enabled: boolean }
    isActive: boolean
  }) => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '300px'
    wrapper.style.padding = '10px'
    wrapper.style.background = '#0f121a'
    wrapper.innerHTML = `<ul class="ch-list" style="list-style: none; margin: 0; padding: 0;">${profileListItem(
      args.profile,
      args.isActive
    )}</ul>`
    return wrapper
  },
  argTypes: {
    'profile.name': {
      control: 'text',
      description: 'Profile name',
    },
    'profile.color': {
      control: 'color',
      description: 'Profile color',
    },
    'profile.notes': {
      control: 'text',
      description: 'Profile description',
    },
    isActive: {
      control: 'boolean',
      description: 'Whether profile is currently selected',
    },
  },
  args: {
    profile: {
      id: 'prod-1',
      name: 'Production',
      color: '#7c3aed',
      notes: 'Auth headers for production API',
      enabled: true,
    },
    isActive: true,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<{
  profile: { id: string; name: string; color: string; notes: string; enabled: boolean }
  isActive: boolean
}>

type ProfileStory = StoryObj<typeof profileMeta>

/**
 * Active profile in the list (currently selected)
 */
export const ProfileListItemActive: ProfileStory = {}

/**
 * Inactive profile in the list (not selected)
 */
export const ProfileListItemInactive: ProfileStory = {
  args: {
    profile: {
      id: 'staging-1',
      name: 'Staging',
      color: '#f97316',
      notes: 'Test environment headers',
      enabled: false,
    },
    isActive: false,
  },
}
