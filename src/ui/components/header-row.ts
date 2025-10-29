/**
 * Header row template function
 * Uses shared buildHeaderRowHTML for DRY rendering
 */
import { buildHeaderRowHTML } from '../lib/header-row-template'

export function headerRow(h: {
  id: string
  header: string
  value?: string
  op: 'set' | 'append' | 'remove'
  enabled?: boolean
}): string {
  return buildHeaderRowHTML({
    id: h.id,
    header: h.header,
    value: h.value,
    enabled: h.enabled,
  })
}
