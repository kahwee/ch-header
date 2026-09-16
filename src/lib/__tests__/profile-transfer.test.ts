import { describe, expect, it } from 'vitest'
import httpsFixture from '../../../docs/examples/https-profile.json'
import { buildRulesFromProfile } from '../dnr-rules'
import { exportProfileJSON, parseHeadersJSON, parseProfileJSON } from '../profile-transfer'

const source = {
  name: 'Local API',
  enabled: true,
  initials: 'L',
  color: 'blue',
  matchers: [{ id: 'm', urlFilter: '127.0.0.1:3002', resourceTypes: ['document'] }],
  requestHeaders: [
    { id: 'h', header: 'Authorization', value: 'demo-only' },
    { header: 'X-Env', value: 'local', enabled: false },
  ],
  responseHeaders: [],
}

describe('portable profiles', () => {
  it('round trips with new IDs, off state, initials and resource type migration', () => {
    const original = parseProfileJSON(JSON.stringify(source))[0]
    const copy = parseProfileJSON(exportProfileJSON([original], false))[0]
    expect(copy.id).not.toBe(original.id)
    expect(copy.matchers[0].id).not.toBe(original.matchers[0].id)
    expect(copy.requestHeaders[0].id).not.toBe(original.requestHeaders[0].id)
    expect(copy.enabled).toBe(false)
    expect(copy.initials).toBe('L')
    expect(copy.matchers[0].resourceTypes).toEqual(['main_frame'])
    expect(copy.requestHeaders[1].enabled).toBe(false)
    expect(copy.requestHeaders[0].value).toBe('demo-only')
  })
  it('blanks common sensitive values by default without changing stored profiles', () => {
    const original = parseProfileJSON(JSON.stringify(source))[0]
    expect(parseProfileJSON(exportProfileJSON([original]))[0].requestHeaders[0].value).toBe('')
    expect(original.requestHeaders[0].value).toBe('demo-only')
    expect(exportProfileJSON([original])).not.toContain(original.id)
  })
  it.each([
    '{',
    'null',
    '[]',
    '{"profiles":[],"version":2}',
    '{"name":"bad","requestHeaders":[{"header":"Bad name","value":"x"}]}',
    '{"name":"bad","requestHeaders":[{"header":"X-Test","value":"a\\nb"}]}',
    '{"name":"bad","matchers":[{"urlFilter":"*","resourceTypes":["invalid"]}]}',
  ])('rejects invalid data: %s', (json) => expect(() => parseProfileJSON(json)).toThrow())
  it('rejects an entire batch when a later profile is invalid', () => {
    expect(() => parseProfileJSON(JSON.stringify([source, { name: '' }]))).toThrow('Profile 2')
  })
})

describe('header-only imports', () => {
  it('uses the same strict header validation and fresh IDs as profile imports', () => {
    const [header] = parseHeadersJSON('{"header":"X-Demo","value":"on"}')
    expect(header).toEqual({
      id: expect.any(String),
      header: 'X-Demo',
      value: 'on',
      enabled: true,
    })
  })

  it.each(['[]', '{', '{"header":"Bad name","value":"x"}', '{"header":"X-Test","value":"a\\nb"}'])(
    'rejects invalid header data: %s',
    (json) => expect(() => parseHeadersJSON(json)).toThrow()
  )
})

it('imports the public HTTPS fixture off with explicit demo domains and exact paths', () => {
  const [profile] = parseProfileJSON(JSON.stringify(httpsFixture))
  expect(profile.enabled).toBe(false)
  expect(profile.accessSites).toEqual(['headers.kahwee.com', 'headers-peer.kahwee.com'])
  const rules = buildRulesFromProfile(profile)
  expect(rules).toHaveLength(2)
  expect(rules.map((rule) => rule.condition.urlFilter)).toEqual([
    '|https://headers.kahwee.com/headers/match|',
    '|https://headers-peer.kahwee.com/headers/match|',
  ])
  for (const rule of rules) {
    expect(rule.condition.requestDomains).toEqual(profile.accessSites)
    expect(rule.action.requestHeaders).toEqual([
      { header: 'X-ChHeader-Test', operation: 'set', value: 'hello-gecko' },
    ])
  }
})
