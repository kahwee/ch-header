import type { Meta, StoryObj } from '@storybook/html'
import { sectionHeader } from '../components/section-header'
import type { SectionHeaderOptions } from '../components/section-header'

const meta: Meta<SectionHeaderOptions> = {
  title: 'ChHeader/Components/Section Header',
  tags: ['autodocs'],
  render: (args) => sectionHeader(args),
}

export default meta
type Story = StoryObj<SectionHeaderOptions>

/**
 * Matchers section with single "Clear all" menu item
 */
export const Matchers: Story = {
  args: {
    title: 'Matchers',
    addButtonId: 'addMatcher',
    addButtonTitle: 'Add matcher',
    menuItems: [{ label: 'Clear all', action: 'clearMatchers' }],
  },
}

/**
 * Request headers section with Sort and Clear options
 */
export const RequestHeaders: Story = {
  args: {
    title: 'Request headers',
    addButtonId: 'addReq',
    addButtonTitle: 'Add header',
    menuItems: [
      { label: 'Sort A-Z', action: 'sortReqHeaders' },
      { label: 'Clear all', action: 'clearReqHeaders' },
    ],
  },
}

/**
 * Response headers section with Sort and Clear options
 */
export const ResponseHeaders: Story = {
  args: {
    title: 'Response headers',
    addButtonId: 'addRes',
    addButtonTitle: 'Add header',
    menuItems: [
      { label: 'Sort A-Z', action: 'sortResHeaders' },
      { label: 'Clear all', action: 'clearResHeaders' },
    ],
  },
}

/**
 * Custom section with multiple menu items
 */
export const CustomWithMultipleItems: Story = {
  args: {
    title: 'Custom Section',
    addButtonId: 'addCustom',
    addButtonTitle: 'Add item',
    menuItems: [
      { label: 'Sort A-Z', action: 'sortCustom' },
      { label: 'Clear all', action: 'clearCustom' },
      { label: 'Export', action: 'exportCustom' },
    ],
  },
}

/**
 * Section with single menu item (minimal)
 */
export const Minimal: Story = {
  args: {
    title: 'Simple Section',
    addButtonId: 'addSimple',
    addButtonTitle: 'Add',
    menuItems: [{ label: 'Clear', action: 'clear' }],
  },
}
