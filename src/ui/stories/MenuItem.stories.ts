import type { Meta, StoryObj } from '@storybook/html'
import { menuItem } from '../components/menu-item'
import type { MenuItemOptions } from '../components/menu-item'

/**
 * Menu Item Stories
 * Individual menu items for use in dropdown menus
 */
const meta: Meta<MenuItemOptions> = {
  title: 'ChHeader/Components/Menu Item',
  tags: ['autodocs'],
  render: (args) => menuItem(args),
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
}

export default meta
type Story = StoryObj<MenuItemOptions>

/**
 * Default menu item
 */
export const Default: Story = {
  args: {
    label: 'Import headers',
    action: 'importHeaders',
  },
}

/**
 * Menu item with title (tooltip)
 */
export const WithTitle: Story = {
  args: {
    label: 'Import headers',
    action: 'importHeaders',
    title: 'Import headers from JSON',
  },
}

/**
 * Delete variant menu item (red hover state)
 */
export const DeleteVariant: Story = {
  args: {
    label: 'Delete',
    action: 'delete',
    variant: 'delete',
  },
}

/**
 * Delete variant with title
 */
export const DeleteWithTitle: Story = {
  args: {
    label: 'Delete profile',
    action: 'deleteProfile',
    variant: 'delete',
    title: 'Permanently delete this profile',
  },
}

/**
 * Standard variant with long label
 */
export const LongLabel: Story = {
  args: {
    label: 'Import entire profile from JSON',
    action: 'importProfile',
    title: 'Import entire profile from JSON',
  },
}

/**
 * Duplicate action menu item
 */
export const Duplicate: Story = {
  args: {
    label: 'Duplicate',
    action: 'duplicate',
  },
}
