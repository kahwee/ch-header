import type { Meta, StoryObj } from '@storybook/html'
import { menuItem } from '../menu-item'
import type { MenuItemOptions } from '../menu-item'

/**
 * Menu Item Component
 *
 * Individual menu items for use in dropdown menus.
 * Use the controls below to explore different variants and options.
 */
const meta = {
  title: 'ChHeader/Components/Menu Item',
  tags: ['autodocs'],
  render: (args) => menuItem(args),
  argTypes: {
    label: {
      control: 'text',
      description: 'Menu item text',
    },
    action: {
      control: 'text',
      description: 'Custom data-action attribute',
    },
    variant: {
      control: 'select',
      options: ['default', 'delete'],
      description: 'Menu item style (default or delete with red hover)',
    },
    title: {
      control: 'text',
      description: 'Optional tooltip text',
    },
  },
  args: {
    label: 'Menu Item',
    action: 'menuAction',
    variant: 'default',
  },
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
} satisfies Meta<MenuItemOptions>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Standard menu item for non-destructive actions
 */
export const Default: Story = {
  args: {
    label: 'Import headers',
    action: 'importHeaders',
  },
}

/**
 * Delete variant with red hover for destructive actions
 */
export const Delete: Story = {
  args: {
    label: 'Delete profile',
    action: 'deleteProfile',
    variant: 'delete',
    title: 'Permanently delete this profile',
  },
}

/**
 * Example with a longer label to demonstrate text wrapping
 */
export const LongLabel: Story = {
  args: {
    label: 'Import entire profile configuration from JSON file',
    action: 'importProfile',
  },
}
