import type { Meta, StoryObj } from '@storybook/html'
import { getSidebarTemplate, profileListItem } from '../popup-template'
import '../components/checkbox-element'
import '@tailwindplus/elements'

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
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// Mock data
const sampleProfiles = [
  {
    id: 'prod-1',
    name: 'Production',
    color: 'purple-700',
    notes: 'Add authentication headers to production API',
    enabled: true,
  },
  {
    id: 'dev-1',
    name: 'Development',
    color: 'blue-700',
    notes: 'Local development configuration',
    enabled: true,
  },
  {
    id: 'staging-1',
    name: 'Staging',
    color: 'emerald-700',
    notes: 'Pre-release testing environment',
    enabled: false,
  },
  {
    id: 'test-1',
    name: 'Testing',
    color: 'amber-700',
    notes: 'QA and integration testing',
    enabled: true,
  },
  {
    id: 'local-1',
    name: 'Local API',
    color: 'violet-700',
    notes: 'Local mock API server',
    enabled: false,
  },
]

export const Default: Story = {
  render: () => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '100%'
    wrapper.style.height = '100vh'
    wrapper.innerHTML = getSidebarTemplate()

    const profileList = wrapper.querySelector('#profileList')
    if (profileList) {
      profileList.innerHTML = sampleProfiles
        .map((p) => profileListItem(p, p.id === 'prod-1'))
        .join('')
    }

    return wrapper
  },
}

export const WithSearchResults: Story = {
  render: () => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '100%'
    wrapper.style.height = '100vh'
    wrapper.innerHTML = getSidebarTemplate()

    const profileList = wrapper.querySelector('#profileList')
    if (profileList) {
      profileList.innerHTML = sampleProfiles.map((p) => profileListItem(p, false)).join('')
    }

    const searchResults = wrapper.querySelector('#searchResults')
    if (searchResults) {
      searchResults.removeAttribute('hidden')
      searchResults.classList.add('p-2')
      const searchResultsHtml = `
        <h2 class="mt-2 mb-2 px-3 text-xs font-semibold text-gray-400">Search results</h2>
        <ul class="list-none m-0 p-0 text-sm text-gray-300" role="list">
          ${sampleProfiles
            .filter((p) => p.name.toLowerCase().includes('dev'))
            .map((p) => profileListItem(p, false))
            .join('')}
        </ul>
      `
      searchResults.innerHTML = searchResultsHtml
    }

    return wrapper
  },
}

export const NoProfiles: Story = {
  render: () => {
    const wrapper = document.createElement('div')
    wrapper.style.width = '100%'
    wrapper.style.height = '100vh'
    wrapper.innerHTML = getSidebarTemplate()

    const profileList = wrapper.querySelector('#profileList')
    if (profileList) {
      profileList.innerHTML = ''
    }

    const noResults = wrapper.querySelector('#noResults')
    if (noResults) {
      noResults.removeAttribute('hidden')
    }

    return wrapper
  },
}
