import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import { documentTitle, siteCopy } from '@/lib/content'
import { getSettings } from '@/lib/data'
import { getLang } from '@/lib/lang'
import { getMetadataBase } from '@/lib/metadata'
import './globals.css'

const plex = IBM_Plex_Sans_Arabic({
  subsets: ['latin', 'arabic'],
  weight: ['400', '600'],
  display: 'swap',
  fallback: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
})

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const lang = getLang()
  const settings = await getSettings()
  const copy = siteCopy(settings, lang)
  const title = documentTitle(settings, lang)
  const description = copy.intro.trim()
  return {
    metadataBase: getMetadataBase(),
    title,
    description: description || undefined,
    openGraph: {
      title,
      description: description || undefined,
      locale: lang === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const lang = getLang()
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <body className={plex.className}>{children}</body>
    </html>
  )
}
