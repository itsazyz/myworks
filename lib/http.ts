const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isHttpUrl(value: string): boolean {
  if (value.length === 0 || value.length > 2000) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isEmail(value: string): boolean {
  return value.length > 0 && value.length <= 200 && emailPattern.test(value)
}
