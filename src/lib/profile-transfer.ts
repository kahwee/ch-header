import { parseAccessSites } from './site-access'
import {
  type HeaderOp,
  isResourceType,
  type Matcher,
  type Profile,
  type ResourceType,
} from './types'

const sensitiveHeader = /authorization|cookie|token|secret|api[-_]?key/i
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

function array(value: unknown, label: string): unknown[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`)
  return value
}

function headers(value: unknown, label: string): HeaderOp[] {
  return array(value, label).map((item, index) => {
    if (!object(item) || typeof item.header !== 'string' || typeof item.value !== 'string')
      throw new Error(`${label}, row ${index + 1}: use string header and value fields.`)
    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(item.header))
      throw new Error(`${label}, row ${index + 1}: invalid header name.`)
    if (/[\r\n]/.test(item.value))
      throw new Error(`${label}, row ${index + 1}: values cannot contain line breaks.`)
    return {
      id: crypto.randomUUID(),
      header: item.header,
      value: item.value,
      enabled: item.enabled !== false,
    }
  })
}

/** Parse a header-only JSON file through the same validation used by profile imports. */
export function parseHeadersJSON(text: string): HeaderOp[] {
  if (text.length > 1_000_000) throw new Error('Choose a JSON file smaller than 1 MB.')
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON. Check commas, quotes and brackets.')
  }
  const parsed = headers(Array.isArray(data) ? data : [data], 'Request headers')
  if (!parsed.length) throw new Error('Add at least one header.')
  return parsed
}

function matchers(value: unknown): Matcher[] {
  return array(value, 'Matchers').map((item, index) => {
    if (!object(item) || typeof item.urlFilter !== 'string')
      throw new Error(`Matcher ${index + 1}: urlFilter must be a string.`)
    const types = array(item.resourceTypes, 'Resource types').map((type) =>
      type === 'document' ? 'main_frame' : type
    )
    if (types.some((type) => typeof type !== 'string' || !isResourceType(type)))
      throw new Error(`Matcher ${index + 1}: unknown request type.`)
    return {
      id: crypto.randomUUID(),
      urlFilter: item.urlFilter || '*',
      resourceTypes: [...new Set(types as ResourceType[])],
    }
  })
}

/** Parse completely before writing any profiles. Imports always get fresh IDs and start off. */
export function parseProfileJSON(text: string): Profile[] {
  if (text.length > 1_000_000) throw new Error('Choose a JSON file smaller than 1 MB.')
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON. Check commas, quotes and brackets.')
  }
  let items: unknown[]
  if (object(data) && 'profiles' in data) {
    if (data.format !== undefined && data.format !== 'chheader')
      throw new Error('This is not a ChHeader export.')
    if (data.version !== undefined && data.version !== 1)
      throw new Error('This export version is not supported.')
    items = array(data.profiles, 'Profiles')
  } else items = Array.isArray(data) ? data : [data]
  if (!items.length) throw new Error('Add at least one profile.')
  if (items.length > 100) throw new Error('Import up to 100 profiles at a time.')
  return items.map((item, index) => {
    if (!object(item) || typeof item.name !== 'string' || !item.name.trim())
      throw new Error(`Profile ${index + 1}: add a name.`)
    return {
      id: crypto.randomUUID(),
      name: item.name.trim(),
      color: typeof item.color === 'string' ? item.color : 'blue',
      notes: typeof item.notes === 'string' ? item.notes : '',
      initials: typeof item.initials === 'string' ? item.initials.slice(0, 1) : undefined,
      enabled: false,
      ...(item.accessSites !== undefined
        ? {
            accessSites: parseAccessSites(
              array(item.accessSites, 'Allowed sites')
                .map((site) => {
                  if (typeof site !== 'string') throw new Error('Allowed sites must be hostnames.')
                  return site
                })
                .join(' ')
            ),
          }
        : {}),
      matchers: matchers(item.matchers),
      requestHeaders: headers(item.requestHeaders, `${item.name}: request headers`),
      responseHeaders: headers(item.responseHeaders, `${item.name}: response headers`),
    }
  })
}

export function hasSensitiveValues(profiles: Profile[]): boolean {
  return profiles.some((profile) =>
    [...profile.requestHeaders, ...profile.responseHeaders].some(
      (header) => sensitiveHeader.test(header.header) && !!header.value
    )
  )
}

/** Portable, versioned data: no internal IDs or active-profile state. */
export function exportProfileJSON(profiles: Profile[], hideSensitive = true): string {
  const cleanHeaders = (items: HeaderOp[]) =>
    items
      .filter((item) => item.header.trim())
      .map(({ header, value, enabled }) => ({
        header,
        value: hideSensitive && sensitiveHeader.test(header) ? '' : value,
        enabled: enabled !== false,
      }))
  return JSON.stringify(
    {
      format: 'chheader',
      version: 1,
      profiles: profiles.map((profile) => ({
        name: profile.name,
        color: profile.color,
        ...(profile.initials ? { initials: profile.initials } : {}),
        ...(profile.accessSites !== undefined ? { accessSites: profile.accessSites } : {}),
        notes: profile.notes || '',
        matchers: profile.matchers.map(({ urlFilter, resourceTypes }) => ({
          urlFilter,
          ...(resourceTypes?.length ? { resourceTypes } : {}),
        })),
        requestHeaders: cleanHeaders(profile.requestHeaders),
        responseHeaders: cleanHeaders(profile.responseHeaders),
      })),
    },
    null,
    2
  )
}
