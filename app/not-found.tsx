import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { siteCopy } from '@/lib/content'
import { getSettings } from '@/lib/data'
import { messages } from '@/lib/i18n'
import { getLang } from '@/lib/lang'

export default async function NotFound() {
  const lang = getLang()
  const text = messages[lang]
  const settings = await getSettings()
  const copy = siteCopy(settings, lang)
  return (
    <>
      <SiteHeader lang={lang} name={copy.name} />
      <main id="content" className="mx-auto w-full max-w-page px-4 py-16">
        <h1 className="text-2xl font-semibold">{text.notFound}</h1>
        <p className="mt-4">
          <Link href="/">{text.backHome}</Link>
        </p>
      </main>
    </>
  )
}
