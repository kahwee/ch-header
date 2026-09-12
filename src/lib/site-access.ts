import type { Profile } from './types'
import { readURLRule } from './url-rule'

/** Explicit hostnames only. Never infer authority from an arbitrary filter or regex. */
export function parseAccessSites(text: string): string[] {
  const sites = text
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((site) => {
      if (!/^[a-z0-9.-]+$/i.test(site) || site.startsWith('.') || site.endsWith('.'))
        throw new Error(
          'Enter hostnames only, such as api.example.com or localhost. No paths, ports or wildcards.'
        )
      const host = new URL(`https://${site}`).hostname
      if (
        host !== site.toLowerCase() ||
        host.split('.').some((label) => !label || label.startsWith('-') || label.endsWith('-'))
      )
        throw new Error('Enter a valid hostname.')
      if (!host.includes('.') && host !== 'localhost')
        throw new Error('Use a complete hostname, or localhost.')
      return host
    })
  if (sites.length > 50) throw new Error('Use up to 50 sites per profile.')
  return [...new Set(sites)]
}

export function suggestedAccessSites(profile: Profile): string[] {
  if (profile.accessSites !== undefined) return parseAccessSites(profile.accessSites.join(' '))
  const sites: string[] = []
  for (const matcher of profile.matchers) {
    const rule = readURLRule(matcher.urlFilter)
    if (rule.mode !== 'site') continue
    try {
      sites.push(...parseAccessSites(new URL(`https://${rule.value}`).hostname))
    } catch {
      /* Unsupported sites need an explicit supported hostname. */
    }
  }
  return [...new Set(sites)]
}

export function siteOrigins(sites: string[]): string[] {
  return parseAccessSites(sites.join(' ')).flatMap((site) => {
    const host = site === 'localhost' || /^[\d.]+$/.test(site) ? site : `*.${site}`
    // Chrome validates each requested pattern against one optional declaration.
    return [`http://${host}/*`, `https://${host}/*`]
  })
}

export function requestSiteAccess(sites: string[]): Promise<boolean> {
  // Invoke directly in the click handler, before any await, to retain the user gesture.
  return new Promise((resolve, reject) => {
    chrome.permissions.request({ origins: siteOrigins(sites) }, (granted) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message))
      else resolve(granted)
    })
  })
}

export function hasSiteAccess(profile: Profile): Promise<boolean> {
  if (!profile.accessSites?.length) return Promise.resolve(false)
  let origins: string[]
  try {
    origins = siteOrigins(profile.accessSites)
    if (!origins.length) return Promise.resolve(false)
  } catch {
    return Promise.resolve(false)
  }
  return new Promise((resolve) => {
    chrome.permissions.contains({ origins }, (granted) =>
      resolve(!chrome.runtime.lastError && granted)
    )
  })
}
