import type { Meta, StoryObj } from '@storybook/html'
import { ghostButton } from '../ghost-button'
import type { GhostButtonOptions } from '../ghost-button'
import trashIcon from '../../../icons/trash.svg?raw'

/**
 * Ghost Button Component
 *
 * Transparent background buttons for secondary/minor actions.
 * Use the controls below to explore different variants and shapes.
 */
const meta = {
  title: 'ChHeader/Components/Ghost Button',
  tags: ['autodocs'],
  render: (args) => ghostButton(args),
  argTypes: {
    icon: {
      control: 'text',
      description: 'SVG icon (raw string)',
    },
    variant: {
      control: 'select',
      options: ['default', 'delete'],
      description: 'Button style variant (default or delete with red hover)',
    },
    circle: {
      control: 'boolean',
      description: 'Use circular shape instead of square',
    },
    action: {
      control: 'text',
      description: 'Custom data-action attribute',
    },
    title: {
      control: 'text',
      description: 'Tooltip text',
    },
  },
  args: {
    icon: trashIcon,
    variant: 'default',
    circle: false,
    action: 'deleteItem',
    title: 'Delete',
  },
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
} satisfies Meta<GhostButtonOptions>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default ghost button - subtle hover effect
 */
export const Default: Story = {
  args: {
    action: 'deleteHeader',
    title: 'Delete header',
  },
}

/**
 * Delete variant - red hover effect for destructive actions
 */
export const Delete: Story = {
  args: {
    action: 'delete',
    title: 'Delete profile',
    variant: 'delete',
  },
}

/**
 * Circular shape - useful for icon-only buttons in compact spaces
 */
export const Circle: Story = {
  args: {
    circle: true,
    title: 'Delete header',
  },
}
