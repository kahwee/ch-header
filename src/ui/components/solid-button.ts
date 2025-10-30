/**
 * Solid button template function
 * Delegates to buildSolidButtonHTML() for single source of truth
 * Used for Storybook documentation and template rendering
 */
import { buildSolidButtonHTML, type SolidButtonOptions } from './solid-button.render'

export function solidButton(options: SolidButtonOptions): string {
  return buildSolidButtonHTML(options)
}

export type { SolidButtonOptions }
