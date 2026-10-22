import { headers } from 'next/headers'

export function getMetadataBase(): URL {
  const vercel = process.env.VERCEL_URL
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '').replace(/\/$/, '')
    try {
      return new URL(`https://${host}`)
    } catch {
      return new URL('http://localhost:3000')
    }
  }

  const headerList = headers()
  const rawHost = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000'
  const host = rawHost.split(',')[0]?.trim() || 'localhost:3000'
  const forwarded = headerList.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const proto =
    forwarded === 'http' || forwarded === 'https'
      ? forwarded
      : host.startsWith('localhost') || host.startsWith('127.0.0.1')
        ? 'http'
        : 'https'
  try {
    return new URL(`${proto}://${host}`)
  } catch {
    return new URL('http://localhost:3000')
  }
}
