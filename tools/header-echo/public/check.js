const host = document.querySelector('#host')
const pattern = document.querySelector('#pattern')
const output = document.querySelector('#results')
const status = document.querySelector('#status')
const run = document.querySelector('#run')
const cross = document.querySelector('#cross')
host.textContent = location.hostname
pattern.textContent = `|${location.origin}/headers/match|`
let peer
fetch('/config', { credentials: 'omit', cache: 'no-store' })
  .then((response) => response.json())
  .then((config) => {
    peer = config.peer
    if (!peer) return
    const link = document.querySelector('#peer')
    link.href = peer
    link.hidden = false
    cross.disabled = false
  })
  .catch(() => {
    status.textContent = 'Second site unavailable. Same-site checks still work.'
  })

async function check(origin) {
  run.disabled = true
  cross.disabled = true
  status.textContent = 'Checking…'
  const results = []
  for (const path of ['/headers/match', '/headers/other', '/redirect']) {
    try {
      const response = await fetch(`${origin}${path}`, { credentials: 'omit', cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      results.push({
        requested: `${origin}${path}`,
        final: response.url,
        status: response.status,
        requestHeaders: data.headers,
        responseHeader: response.headers.get('X-ChHeader-Response'),
      })
    } catch {
      results.push({
        requested: `${origin}${path}`,
        error:
          'Request blocked or unavailable. Reload both test pages and retry. Header behavior is inconclusive.',
      })
    }
  }
  output.textContent = JSON.stringify(results, null, 2)
  const failures = results.filter((result) => result.error).length
  status.textContent = failures
    ? `${failures} of ${results.length} requests failed. Header behavior is inconclusive.`
    : 'All requests returned. Compare matching, excluded and redirected paths.'
  run.disabled = false
  cross.disabled = !peer
}
run.addEventListener('click', () => void check(location.origin))
cross.addEventListener('click', () => void check(peer))
