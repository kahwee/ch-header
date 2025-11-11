import type { Meta, StoryObj } from '@storybook/html'
import { getPopupTemplate, profileListItem } from '../popup-template'
import { headerRow } from '../../components/headers/header-row'
import { matcherRow } from '../../components/matchers/matcher-row'
import '../../components/common/checkbox-element'
import '@tailwindplus/elements'

/**
 * Full Popup Layout
 *
 * Complete extension UI showing both sidebar with profile list and the detail panel
 * for editing the selected profile. This demonstrates the main user interface with
 * profiles, matchers, request headers, and response headers.
 */
const meta = {
  title: 'ChHeader/Layouts/Full Layout',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'iphonese',
    },
    docs: {
      description: {
        component:
          'The main extension layout with sidebar navigation and detail editor. Users can switch between profiles, add matchers to target specific URLs, and configure HTTP headers.',
      },
    },
  },
} satisfies Meta<Record<string, unknown>>

export default meta
type Story = StoryObj<typeof meta>

// Mock data
const sampleProfiles = [
  {
    id: 'prod-1',
    name: 'Production',
    color: 'purple-700',
    notes: 'Add authentication headers to production API endpoints',
    enabled: true,
    matchers: [{ id: 'm1', urlFilter: 'api.example.com', label: '', resourceTypes: [] }],
    requestHeaders: [
      { id: 'h1', header: 'x-forwarded-for', value: '1.2.3.4', op: 'set' as const, enabled: true },
      {
        id: 'h2',
        header: 'authorization',
        value: 'Bearer token123',
        op: 'set' as const,
        enabled: true,
      },
      { id: 'h3', header: 'x-api-key', value: 'api_key_secret', op: 'set' as const, enabled: true },
    ],
    responseHeaders: [],
  },
  {
    id: 'dev-1',
    name: 'Development',
    color: 'blue-700',
    notes: 'Local development configuration with debug headers',
    enabled: true,
    matchers: [{ id: 'm2', urlFilter: 'localhost:3000', label: '', resourceTypes: [] }],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'staging-1',
    name: 'Staging',
    color: 'emerald-700',
    notes: 'Pre-release testing environment',
    enabled: false,
    matchers: [
      { id: 'm4', urlFilter: 'staging.api.example.com', label: 'Staging API', resourceTypes: [] },
      { id: 'm5', urlFilter: '*.staging.example.com', label: 'All Staging', resourceTypes: [] },
    ],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'test-1',
    name: 'Testing',
    color: 'amber-700',
    notes: 'QA and integration testing',
    enabled: true,
    matchers: [
      { id: 'm6', urlFilter: 'test.example.com', label: 'Test Environment', resourceTypes: [] },
    ],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'local-1',
    name: 'Local API',
    color: 'violet-700',
    notes: 'Local mock API server',
    enabled: false,
    matchers: [{ id: 'm3', urlFilter: 'localhost:8000', label: '', resourceTypes: [] }],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'beta-1',
    name: 'Beta API',
    color: 'pink-700',
    notes: 'Early access beta features',
    enabled: true,
    matchers: [
      { id: 'm7', urlFilter: 'beta.example.com', label: 'Beta Features', resourceTypes: [] },
      { id: 'm8', urlFilter: 'api-beta.example.com', label: 'Beta API', resourceTypes: [] },
    ],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'sandbox-1',
    name: 'Sandbox',
    color: 'cyan-700',
    notes: 'Safe playground for testing',
    enabled: false,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'cache-1',
    name: 'Cache Control',
    color: 'teal-700',
    notes: 'Add cache headers for performance testing',
    enabled: true,
    matchers: [{ id: 'm9', urlFilter: '*.example.com', label: 'All Domains', resourceTypes: [] }],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'cors-1',
    name: 'CORS Headers',
    color: 'orange-700',
    notes: 'CORS configuration for cross-origin requests',
    enabled: false,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'auth-1',
    name: 'Auth Headers',
    color: 'indigo-700',
    notes: 'Custom authentication token headers',
    enabled: true,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'mobile-1',
    name: 'Mobile API',
    color: 'violet-400',
    notes: 'Mobile-specific API endpoints and headers',
    enabled: false,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'web-1',
    name: 'Web API',
    color: 'blue-300',
    notes: 'Web application API configuration',
    enabled: true,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'analytics-1',
    name: 'Analytics',
    color: 'amber-400',
    notes: 'Analytics tracking and telemetry headers',
    enabled: false,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'payment-1',
    name: 'Payment Gateway',
    color: 'cyan-400',
    notes: 'Payment processing API configuration',
    enabled: true,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'webhook-1',
    name: 'Webhooks',
    color: '#c7d2fe',
    notes: 'Webhook handler configuration',
    enabled: false,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'graphql-1',
    name: 'GraphQL',
    color: '#dc2626',
    notes: 'GraphQL API endpoint configuration',
    enabled: true,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'rest-1',
    name: 'REST API',
    color: '#059669',
    notes: 'REST API endpoint configuration',
    enabled: true,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'legacy-1',
    name: 'Legacy API',
    color: '#64748b',
    notes: 'Legacy API support for backward compatibility',
    enabled: false,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'cdn-1',
    name: 'CDN',
    color: '#e879f9',
    notes: 'CDN configuration for static assets',
    enabled: true,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'monitor-1',
    name: 'Monitoring',
    color: '#4ade80',
    notes: 'Monitoring and observability headers',
    enabled: true,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
  {
    id: 'debug-1',
    name: 'Debug Mode',
    color: '#ff6b6b',
    notes: 'Enable debug logging and verbose output',
    enabled: false,
    matchers: [],
    requestHeaders: [],
    responseHeaders: [],
  },
]

const sampleProfile = sampleProfiles[0]

/**
 * Empty state with no profiles created yet
 */
export const Empty: Story = {
  render: () => {
    const container = document.createElement('div')
    container.innerHTML = getPopupTemplate()

    const app = container.querySelector('#app')
    if (!app) throw new Error('App element not found')

    // Keep detail empty - no profile selected
    const detailPane = app.querySelector('#detail')
    if (detailPane) detailPane.classList.add('hidden')

    return app as HTMLElement
  },
}

/**
 * Full layout with multiple profiles and active profile showing details.
 * Demonstrates the complete UI with sidebar navigation and profile editor.
 */
export const WithProfile: Story = {
  render: () => {
    const container = document.createElement('div')
    container.innerHTML = getPopupTemplate()

    const app = container.querySelector('#app')
    if (!app) throw new Error('App element not found')

    // Populate profile list with all 20+ profiles
    const profileList = app.querySelector('#profileList') as HTMLUListElement
    if (profileList) {
      profileList.innerHTML = sampleProfiles.map((p, idx) => profileListItem(p, idx === 0)).join('')
    }

    // Show detail pane
    const detailEmpty = app.querySelector('#detailEmpty')
    const detailPane = app.querySelector('#detail')
    if (detailEmpty) detailEmpty.classList.add('hidden')
    if (detailPane) detailPane.classList.remove('hidden')

    // Populate detail form with first profile
    const nameInput = app.querySelector('#profileName') as HTMLInputElement
    const colorInput = app.querySelector('#profileColor') as HTMLInputElement
    const notesInput = app.querySelector('#profileNotes') as HTMLTextAreaElement
    const enabledInput = app.querySelector('#enabled') as HTMLInputElement

    if (nameInput) nameInput.value = sampleProfile.name
    if (colorInput) colorInput.value = sampleProfile.color
    if (notesInput) notesInput.value = sampleProfile.notes || ''
    if (enabledInput) enabledInput.checked = sampleProfile.enabled

    // Populate request headers
    const reqHeaders = app.querySelector('#reqHeaders')
    if (reqHeaders) {
      reqHeaders.innerHTML = sampleProfile.requestHeaders.map((h) => headerRow(h)).join('')
    }

    // Populate matchers
    const matchers = app.querySelector('#matchers')
    if (matchers) {
      matchers.innerHTML = sampleProfile.matchers.map((m) => matcherRow(m)).join('')
    }

    return app as HTMLElement
  },
}
