/** URL rule editor conversions. Existing raw filters remain compatible. */
export type URLRuleMode = 'site' | 'pattern' | 'regex' | 'all'

export function readURLRule(filter: string): { mode: URLRuleMode; value: string } {
  if (!filter || filter === '*') return { mode: 'all', value: '' }
  if (filter.startsWith('regex:')) return { mode: 'regex', value: filter.slice(6) }
  if (/^\|\|[^/*^|]+\^$/.test(filter)) return { mode: 'site', value: filter.slice(2, -1) }
  return { mode: 'pattern', value: filter }
}

export function writeURLRule(mode: URLRuleMode, value: string): string {
  if (mode === 'all') return '*'
  const input = value.trim()
  if (!input) throw new Error('Enter a site or rule. Choose All sites to match everywhere.')
  if (mode === 'regex') return `regex:${input}`
  if (mode === 'pattern') {
    if (input === '*') throw new Error('Choose All sites to match everywhere.')
    if (input.startsWith('regex:')) throw new Error('Choose Regex mode and omit the regex: prefix.')
    if (/[^\x21-\x7e]/.test(input))
      throw new Error('URL patterns cannot contain spaces or non-ASCII characters.')
    return input
  }
  if (
    Array.from(input).some(
      (char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127 || char === '\\'
    ) ||
    !/^(?:https?:\/\/)?[^/?#]+\/?$/i.test(input)
  ) {
    throw new Error('Enter a hostname without spaces, control characters or extra slashes.')
  }
  // A site is a host, not a substring anywhere in the URL. Keep paths out of this mode.
  let url: URL
  try {
    url = new URL(input.includes('://') ? input : `https://${input}`)
  } catch {
    throw new Error('Enter a hostname, such as api.example.com or localhost:3002.')
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    /[*^|]/.test(input)
  ) {
    throw new Error('Use a hostname only. Choose URL pattern for paths or wildcards.')
  }
  // URL normalizes default ports away; keep an explicitly requested port scoped.
  const authority = input.replace(/^https?:\/\//i, '').replace(/\/$/, '')
  const explicitPort = authority.match(/:(\d+)$/)?.[1]
  const host = explicitPort ? `${url.hostname}:${Number(explicitPort)}` : url.host
  return `||${host}^`
}

/** Chrome uses RE2, so JavaScript RegExp is not an adequate validator. */
export async function validateRegexFilter(filter: string): Promise<void> {
  if (!filter.startsWith('regex:')) return
  const regex = filter.slice(6)
  if (!regex) throw new Error('Enter a regular expression.')
  const result = await chrome.declarativeNetRequest.isRegexSupported({
    regex,
    isCaseSensitive: false,
  })
  if (!result.isSupported) {
    throw new Error(
      result.reason === 'memoryLimitExceeded'
        ? 'This regex is too complex for Chrome. Simplify it or use Site mode.'
        : 'Chrome does not support this regex. Check its syntax or use Site mode.'
    )
  }
}
