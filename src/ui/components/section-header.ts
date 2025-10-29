/**
 * Section header template function
 * Reusable header with label, divider line, add button, and dropdown menu
 * Used by both popup template and Storybook stories
 */
import {
  buildSectionHeaderHTML,
  type MenuItem,
  type SectionHeaderOptions,
} from './section-header.render'

export function sectionHeader(opts: SectionHeaderOptions): string {
  return buildSectionHeaderHTML(opts)
}

export type { MenuItem, SectionHeaderOptions }
