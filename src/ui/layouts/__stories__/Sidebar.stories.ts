import type { Meta, StoryObj } from '@storybook/html'
import { getSidebarTemplate, profileListItem } from '../../core/popup-template'
import '../../components/common/checkbox-element'

/**
 * Sidebar command palette component showing profile search, filtering, and selection.
 * This is the primary UI component for the ChHeader extension.
 * Features: Search filtering, keyboard navigation hints, new profile button
 */
const meta = {
  title: 'ChHeader/Sidebar',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<Record<string, unknown>>

export default meta
type Story = StoryObj<typeof meta>

// Mock data
const sampleProfiles = [
  {
    id: 'prod-1',
    name: 'Production',
    color: 'purple',
    notes: 'Add authentication headers to production API',
    enabled: true,
  },
  {
    id: 'dev-1',
    name: 'Development',
    color: 'blue',
    notes: 'Local development configuration',
    enabled: true,
  },
  {
    id: 'staging-1',
    name: 'Staging',
    color: 'emerald',
    notes: 'Pre-release testing environment',
    enabled: false,
  },
  {
    id: 'test-1',
    name: 'Testing',
    color: 'amber',
    notes: 'QA and integration testing',
    enabled: true,
  },
  {
    id: 'local-1',
    name: 'Local API',
    color: 'violet',
    notes: 'Local mock API server',
    enabled: false,
  },
]

export const Default: Story = {
  render: () => {
    const container = document.createElement('div')
    container.className = 'app-shell'
    container.innerHTML = getSidebarTemplate()

    const profileList = container.querySelector('#profileList')
    if (profileList) {
      profileList.innerHTML = sampleProfiles
        .map((p) => profileListItem(p, p.id === 'prod-1'))
        .join('')
    }

    return container
  },
}

export const WithSearchResults: Story = {
  render: () => {
    const container = document.createElement('div')
    container.className = 'app-shell'
    container.innerHTML = getSidebarTemplate()

    const profileList = container.querySelector('#profileList')
    if (profileList) {
      profileList.innerHTML = sampleProfiles.map((p) => profileListItem(p, false)).join('')
    }

    const searchResults = container.querySelector('#searchResults')
    if (searchResults) {
      searchResults.removeAttribute('hidden')
      searchResults.classList.add('search-results')
      const searchResultsHtml = `
        <h2 class="search-results__title">Search results</h2>
        <ul class="search-results__list" role="list">
          ${sampleProfiles
            .filter((p) => p.name.toLowerCase().includes('dev'))
            .map((p) => profileListItem(p, false))
            .join('')}
        </ul>
      `
      searchResults.innerHTML = searchResultsHtml
    }

    return container
  },
}

export const NoProfiles: Story = {
  render: () => {
    const container = document.createElement('div')
    container.className = 'app-shell'
    container.innerHTML = getSidebarTemplate()

    const profileList = container.querySelector('#profileList')
    if (profileList) {
      profileList.innerHTML = ''
    }

    const noResults = container.querySelector('#noResults')
    if (noResults) {
      noResults.removeAttribute('hidden')
    }

    return container
  },
}
