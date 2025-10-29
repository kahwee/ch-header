/**
 * Matcher row template function
 * Uses shared buildMatcherRowHTML for DRY rendering
 */
import { buildMatcherRowHTML } from '../lib/matcher-row.render'

export function matcherRow(m: {
  id: string
  urlFilter: string
  label?: string
  resourceTypes?: string[]
}): string {
  return buildMatcherRowHTML({
    id: m.id,
    urlFilter: m.urlFilter,
    resourceTypes: m.resourceTypes,
  })
}
