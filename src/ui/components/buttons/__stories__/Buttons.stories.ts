import type { Meta, StoryObj } from '@storybook/html'
import { solidButton } from '../solid-button'
import type { SolidButtonOptions } from '../solid-button'
import plusIcon from '../../../icons/plus.svg?raw'

/**
 * Solid Button Component
 *
 * Filled background buttons for primary and secondary actions.
 * Use the controls below to explore different variants, sizes, and states.
 */
const meta = {
  title: 'ChHeader/Components/Solid Button',
  tags: ['autodocs'],
  render: (args) => solidButton(args),
  argTypes: {
    text: {
      control: 'text',
      description: 'Button text label',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Button style variant',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md'],
      description: 'Button size',
    },
    icon: {
      control: 'text',
      description: 'SVG icon (raw string)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Button type attribute',
    },
    action: {
      control: 'text',
      description: 'Custom data-action attribute',
    },
  },
  args: {
    text: 'Button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    type: 'button',
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<SolidButtonOptions>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Primary button - the main call-to-action style
 */
export const Primary: Story = {
  args: {
    text: 'Apply',
    variant: 'primary',
  },
}

/**
 * Secondary button - for less prominent actions
 */
export const Secondary: Story = {
  args: {
    text: 'Cancel',
    variant: 'secondary',
  },
}

/**
 * Button with icon and text
 */
export const WithIcon: Story = {
  args: {
    text: 'New Profile',
    icon: plusIcon,
    variant: 'primary',
  },
}

/**
 * Small button size
 */
export const Small: Story = {
  args: {
    text: 'New',
    icon: plusIcon,
    variant: 'primary',
    size: 'sm',
  },
}
