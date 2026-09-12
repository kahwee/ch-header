// Intentionally small allowlist: unknown headers may contain credentials.
const visibleHeaders = ['accept', 'content-type', 'x-env', 'x-chheader-test']

function peerOrigin(url) {
  if (!/^chheader-check(?:-peer)?\.[a-z0-9-]+\.workers\.dev$/.test(url.hostname)) return null
  const peer = new URL(url.origin)
  peer.hostname = url.hostname.startsWith('chheader-check-peer.')
    ? url.hostname.replace('chheader-check-peer.', 'chheader-check.')
    : url.hostname.replace('chheader-check.', 'chheader-check-peer.')
  return peer.origin
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const peer = peerOrigin(url)
    const headers = new Headers({
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': `default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self' ${peer || ''}; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`,
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-Robots-Tag': 'noindex, nofollow',
    })
    // Only this tester's sibling may read cross-origin demo responses. Never credentials.
    if (peer && request.headers.get('Origin') === peer) {
      headers.set('Access-Control-Allow-Origin', peer)
      headers.set('Vary', 'Origin')
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'X-ChHeader-Test, X-Env, Content-Type')
      headers.set('Access-Control-Expose-Headers', 'X-ChHeader-Response')
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (!['GET', 'HEAD'].includes(request.method)) {
      headers.set('Allow', 'GET, HEAD, OPTIONS')
      return new Response(null, { status: 405, headers })
    }
    let response
    if (url.pathname === '/config') {
      response = Response.json({ peer })
    } else if (['/headers/match', '/headers/other'].includes(url.pathname)) {
      response = Response.json({
        host: url.hostname,
        path: url.pathname,
        headers: Object.fromEntries(
          visibleHeaders.map((name) => [name, request.headers.get(name)])
        ),
        note: 'Only the listed demo headers are displayed. Other headers, cookies, IP addresses and query strings are omitted.',
      })
      headers.set('X-ChHeader-Response', 'original')
    } else if (url.pathname === '/redirect') {
      response = new Response(null, { status: 302, headers: { Location: '/headers/other' } })
    } else {
      response = await env.ASSETS.fetch(request)
    }
    const result = new Response(request.method === 'HEAD' ? null : response.body, response)
    for (const [key, value] of headers) result.headers.set(key, value)
    return result
  },
}
