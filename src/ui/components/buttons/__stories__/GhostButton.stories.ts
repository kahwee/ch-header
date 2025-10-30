import type { Meta, StoryObj } from '@storybook/html'
import { ghostButton } from '../ghost-button'
import type { GhostButtonOptions } from '../ghost-button'
import trashIcon from '../../../icons/trash.svg?raw'

/**
 * Ghost Button Stories
 * Transparent background buttons for secondary/minor actions
 */
const meta: Meta<GhostButtonOptions> = {
  title: 'ChHeader/Components/Ghost Button',
  tags: ['autodocs'],
  render: (args) => ghostButton(args),
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
}

export default meta
type Story = StoryObj<GhostButtonOptions>

/**
 * Default ghost button with action
 */
export const Default: Story = {
  args: {
    icon: trashIcon,
    action: 'deleteHeader',
    title: 'Delete header',
    variant: 'default',
  },
}

/**
 * Default ghost button, circular shape
 */
export const DefaultCircle: Story = {
  args: {
    icon: trashIcon,
    action: 'deleteHeader',
    title: 'Delete header',
    variant: 'default',
    circle: true,
  },
}

/**
 * Delete variant ghost button (red hover)
 */
export const DeleteVariant: Story = {
  args: {
    icon: trashIcon,
    action: 'delete',
    title: 'Delete profile',
    variant: 'delete',
  },
}

/**
 * Delete variant ghost button, circular shape
 */
export const DeleteVariantCircle: Story = {
  args: {
    icon: trashIcon,
    action: 'delete',
    title: 'Delete profile',
    variant: 'delete',
    circle: true,
  },
}
