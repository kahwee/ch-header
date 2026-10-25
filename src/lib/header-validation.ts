/** Shared field validation for imports and live header drafts. */
export function headerNameError(value: string): string | null {
  if (!value) return 'Enter a header name.'
  return /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(value)
    ? null
    : 'Header names cannot contain spaces or other invalid characters.'
}

export function headerValueError(value: string): string | null {
  if (/[\r\n]/.test(value)) return 'Header values cannot contain line breaks.'
  for (const char of value) {
    const code = char.charCodeAt(0)
    if ((code < 32 && code !== 9) || code === 127) {
      return 'Header values cannot contain control characters.'
    }
  }
  return null
}
