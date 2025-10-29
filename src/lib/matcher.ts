/**
 * URL matcher utilities supporting multiple pattern formats
 * - Simple: Basic domain/path matching
 * - Wildcard: * matches any characters
 * - Regex: Full regex patterns with regex: prefix
 */

export type MatcherFormat = 'simple' | 'wildcard' | 'regex'

/**
 * Detect the format of a URL filter pattern
 */
export function detectFormat(pattern: string): MatcherFormat {
  if (!pattern) return 'simple'

  // Check if it's a regex pattern
  if (pattern.startsWith('regex:')) {
    return 'regex'
  }

  // Check if it contains wildcard characters
  if (pattern.includes('*')) {
    return 'wildcard'
  }

  // Default to simple
  return 'simple'
}

/**
 * Validate a URL filter pattern
 */
export function validatePattern(pattern: string): { valid: boolean; error?: string } {
  if (!pattern) {
    return { valid: false, error: 'Pattern cannot be empty' }
  }

  const format = detectFormat(pattern)

  if (format === 'regex') {
    const regexPattern = pattern.slice(6) // Remove 'regex:' prefix
    try {
      new RegExp(regexPattern)
      return { valid: true }
    } catch (e) {
      return {
        valid: false,
        error: `Invalid regex: ${e instanceof Error ? e.message : 'Unknown error'}`,
      }
    }
  }

  // Simple and wildcard patterns are generally valid
  // Basic validation for invalid characters (check before regex: prefix)
  const invalidChars = /[[\]{}()]/
  if (invalidChars.test(pattern)) {
    return {
      valid: false,
      error: 'Invalid characters. Use "regex:" prefix for complex patterns.',
    }
  }

  return { valid: true }
}

/**
 * Generate example URLs that would match a pattern
 * @internal Used only in tests
 */
function generateExamples(pattern: string): string[] {
  const format = detectFormat(pattern)

  switch (format) {
    case 'simple':
      return [pattern, `${pattern}/api`, `${pattern}/api/users`, `${pattern}/admin`].filter(Boolean)

    case 'wildcard':
      // Generate examples based on wildcard pattern
      if (pattern.includes('*')) {
        const base = pattern.replace(/\*/g, 'example')
        return [base, `${base}/api`, `${base}/users`]
      }
      return [pattern]

    case 'regex':
      // For regex, just show the pattern itself
      return [pattern]

    default:
      return []
  }
}

/**
 * Get human-readable format name
 * @internal Used only in tests
 */
function getFormatName(format: MatcherFormat): string {
  switch (format) {
    case 'simple':
      return 'Simple'
    case 'wildcard':
      return 'Wildcard'
    case 'regex':
      return 'Regex'
  }
}

/**
 * Get format help text
 * @internal Used only in tests
 */
function getFormatHelp(format: MatcherFormat): string {
  switch (format) {
    case 'simple':
      return 'Match by domain or host. Example: localhost:3002'
    case 'wildcard':
      return 'Use * as wildcard. Example: localhost:3002/* or *.api.example.com'
    case 'regex':
      return 'Full regex pattern. Example: regex:localhost:30(0[0-9])'
  }
}

// Export for testing
export { generateExamples, getFormatName, getFormatHelp }
