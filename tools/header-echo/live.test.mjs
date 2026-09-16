import assert from 'node:assert/strict'
import { test } from 'node:test'

// Deliberately fixed demo hosts. Never send real credentials or personal data.
const origins = ['https://headers.kahwee.com', 'https://headers-peer.kahwee.com']
const get = (url, options = {}) =>
  fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000), ...options })

for (const origin of origins) {
  const peer = origins.find((value) => value !== origin)
  test(`${origin}: demo headers, omission and security headers`, async () => {
    for (const path of ['/headers/match', '/headers/other']) {
      const response = await get(origin + path, {
        headers: {
          'X-ChHeader-Test': 'live-demo',
          Authorization: 'demo-redact-me',
          Cookie: 'demo=demo-redact-me',
          'X-Private': 'demo-redact-me',
        },
      })
      assert.equal(response.status, 200)
      const text = await response.text()
      assert.ok(!text.includes('demo-redact-me'))
      const data = JSON.parse(text)
      assert.equal(data.host, new URL(origin).hostname)
      assert.equal(data.headers['x-chheader-test'], 'live-demo')
      assert.equal(response.headers.get('X-ChHeader-Response'), 'original')
      assert.equal(response.headers.get('Cache-Control'), 'no-store')
      assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff')
      assert.match(response.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/)
    }
  })
  test(`${origin}: CORS only allows its peer, not the main site or lookalikes`, async () => {
    for (const caller of [peer, 'https://kahwee.com', 'https://headers.kahwee.com.evil.example']) {
      const response = await get(`${origin}/headers/match`, { headers: { Origin: caller } })
      assert.equal(response.status, 200)
      assert.equal(
        response.headers.get('Access-Control-Allow-Origin'),
        caller === peer ? peer : null
      )
      assert.equal(response.headers.get('Access-Control-Allow-Credentials'), null)
    }
  })
  test(`${origin}: fixed redirect and peer configuration`, async () => {
    const redirect = await get(`${origin}/redirect?next=https://example.com`)
    assert.equal(redirect.status, 302)
    assert.equal(redirect.headers.get('Location'), '/headers/other')
    const config = await get(`${origin}/config`)
    assert.equal(config.status, 200)
    assert.deepEqual(await config.json(), { peer })
  })
}
