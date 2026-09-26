/** Shared field validation for imports and live header drafts. */
export function headerNameError(value: string): string | null {
  if (!value) return 'Enter a header name.'
  return /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(value)
    ? null
    : 'Header names cannot contain spaces or other invalid characters.'
}

export function headerValueError(value: string): string | null {
  return /[\r\n]/.test(value) ? 'Header values cannot contain line breaks.' : null
}
