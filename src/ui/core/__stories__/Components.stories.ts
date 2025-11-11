import type { Meta, StoryObj } from '@storybook/html'
import { headerRow } from '../../components/headers/header-row'
import '../../components/common/checkbox-element'

type HeaderRowArgs = {
  id: string
  header: string
  value: string
  op: 'set'
  enabled: boolean
}

/**
 * Header Row Component
 *
 * Table row for editing HTTP request/response headers with inline controls.
 */
const headerMeta: Meta<HeaderRowArgs> = {
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
}

export default headerMeta
type HeaderStory = StoryObj<HeaderRowArgs>

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

// Profile List Item stories have been moved to ProfileListItem.stories.ts to avoid
// multiple meta exports in a single file, which Storybook doesn't support
