import assert from 'node:assert/strict'
import { test } from 'node:test'
import worker from './worker.js'
const origin = 'https://headers.kahwee.com'
const peer = 'https://headers-peer.kahwee.com'
const env = { ASSETS: { fetch: async () => new Response('static') } }
const request = (path, options) => worker.fetch(new Request(origin + path, options), env)

test('echoes demo values, omits credentials, IP, unknown headers and query secrets', async () => {
  const response = await request('/headers/match?token=hidden', {
    headers: {
      'X-ChHeader-Test': 'demo',
      Authorization: 'hidden',
      Cookie: 'hidden',
      'X-Private-Key': 'hidden',
      'CF-Connecting-IP': 'hidden',
    },
  })
  const text = await response.text()
  assert.ok(!text.includes('hidden'))
  assert.equal(JSON.parse(text).headers['x-chheader-test'], 'demo')
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.equal(response.headers.get('X-ChHeader-Response'), 'original')
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff')
})
test('limits CORS to sibling origin, never includes credentials', async () => {
  for (const site of [peer, 'https://unrelated.example', 'null']) {
    const response = await request('/headers/match', { headers: { Origin: site } })
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), site === peer ? peer : null)
    assert.equal(response.headers.get('Access-Control-Allow-Credentials'), null)
  }
})
test('does not execute reflected HTML, reflect bodies, or redirect to user input', async () => {
  const response = await request('/headers/match', {
    headers: { 'X-ChHeader-Test': '<script>alert(1)</script>' },
  })
  assert.match(response.headers.get('Content-Type'), /application\/json/)
  assert.match(response.headers.get('Content-Security-Policy'), /default-src 'none'/)
  assert.equal((await request('/headers/match', { method: 'POST', body: 'secret' })).status, 405)
  assert.equal(
    (await request('/redirect?next=https://example.com')).headers.get('Location'),
    '/headers/other'
  )
})
test('HEAD has no body and static assets receive security headers', async () => {
  assert.equal(await (await request('/headers/match', { method: 'HEAD' })).text(), '')
  assert.equal((await request('/')).headers.get('Cache-Control'), 'no-store')
})

test('custom domains allow only their exact peer, never the main website', async () => {
  for (const [host, sibling] of [
    ['headers.kahwee.com', 'headers-peer.kahwee.com'],
    ['headers-peer.kahwee.com', 'headers.kahwee.com'],
  ]) {
    for (const incoming of [
      `https://${sibling}`,
      'https://kahwee.com',
      'https://headers.kahwee.com.evil.example',
    ]) {
      const response = await worker.fetch(
        new Request(`https://${host}/headers/match`, { headers: { Origin: incoming } }),
        env
      )
      assert.equal(
        response.headers.get('Access-Control-Allow-Origin'),
        incoming === `https://${sibling}` ? incoming : null
      )
      assert.ok(response.headers.get('Content-Security-Policy').includes(`https://${sibling}`))
    }
  }
})
