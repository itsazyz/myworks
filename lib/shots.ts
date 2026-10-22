import { isHttpUrl } from '@/lib/http'

export const SHOT_MIME = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
} as const

export type ShotMime = keyof typeof SHOT_MIME

export const MAX_SHOT_BYTES = 5 * 1024 * 1024
export const MAX_REQUEST_BYTES = 6 * 1024 * 1024

const MARKER = '/storage/v1/object/public/project-shots/'

export function isShotMime(value: string): value is ShotMime {
  return Object.prototype.hasOwnProperty.call(SHOT_MIME, value)
}

export function matchesShotBytes(mime: ShotMime, bytes: Uint8Array): boolean {
  if (mime === 'image/png') {
    return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  }
  if (mime === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
}

export function storagePathFromPublicUrl(url: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base || !isHttpUrl(url)) return null
  let expectedHost = ''
  let parsed: URL
  try {
    expectedHost = new URL(base).host
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.host !== expectedHost || !parsed.pathname.startsWith(MARKER)) return null
  let decoded = ''
  try {
    decoded = decodeURIComponent(parsed.pathname.slice(MARKER.length))
  } catch {
    return null
  }
  if (!decoded || decoded.startsWith('/') || decoded.includes('..') || decoded.includes('\\')) return null
  return decoded
}
