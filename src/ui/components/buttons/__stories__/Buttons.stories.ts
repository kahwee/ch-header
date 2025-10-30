import type { Meta, StoryObj } from '@storybook/html'
import { solidButton } from '../solid-button'
import type { SolidButtonOptions } from '../solid-button'
import plusIcon from '../../../../icons/plus.svg?raw'

/**
 * Solid Button Stories
 * Filled background buttons for primary and secondary actions
 */
const meta: Meta<SolidButtonOptions> = {
  title: 'ChHeader/Components/Solid Button',
  tags: ['autodocs'],
  render: (args) => solidButton(args),
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<SolidButtonOptions>

/**
 * Primary solid button with text only
 */
export const PrimaryText: Story = {
  args: {
    text: 'Apply',
    variant: 'primary',
    size: 'md',
  },
}

/**
 * Primary solid button with icon and text
 */
export const PrimaryWithIcon: Story = {
  args: {
    text: 'New Profile',
    icon: plusIcon,
    variant: 'primary',
    size: 'md',
  },
}

/**
 * Primary solid button, small size
 */
export const PrimarySmall: Story = {
  args: {
    text: 'New',
    icon: plusIcon,
    variant: 'primary',
    size: 'sm',
  },
}

/**
 * Secondary solid button with text only
 */
export const SecondaryText: Story = {
  args: {
    text: 'Cancel',
    variant: 'secondary',
    size: 'md',
  },
}

/**
 * Secondary solid button with icon and text
 */
export const SecondaryWithIcon: Story = {
  args: {
    text: 'New',
    icon: plusIcon,
    variant: 'secondary',
    size: 'md',
  },
}

/**
 * Secondary solid button, small size
 */
export const SecondarySmall: Story = {
  args: {
    text: 'New',
    icon: plusIcon,
    variant: 'secondary',
    size: 'sm',
  },
}

/**
 * Primary button with action attribute
 */
export const WithAction: Story = {
  args: {
    text: 'Delete',
    variant: 'primary',
    size: 'md',
    action: 'deleteProfile',
  },
}

/**
 * Button with submit type
 */
export const SubmitType: Story = {
  args: {
    text: 'Submit',
    variant: 'primary',
    size: 'md',
    type: 'submit',
  },
}

/**
 * Primary button in disabled state
 */
export const PrimaryDisabled: Story = {
  args: {
    text: 'Apply',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
}

/**
 * Secondary button in disabled state
 */
export const SecondaryDisabled: Story = {
  args: {
    text: 'Cancel',
    variant: 'secondary',
    size: 'md',
    disabled: true,
  },
}

/**
 * Primary button with icon, disabled
 */
export const PrimaryDisabledWithIcon: Story = {
  args: {
    text: 'New Profile',
    icon: plusIcon,
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
}
