import Link from 'next/link'
import { LanguageToggle } from '@/components/language-toggle'
import { messages, type Lang } from '@/lib/i18n'

export function SiteHeader({ lang, name }: { lang: Lang; name: string }) {
  const text = messages[lang]
  return (
    <header className="relative border-b border-ink">
      <div className="mx-auto flex w-full max-w-page items-center justify-between gap-4 px-4 py-4">
        <a href="#content" className="absolute start-4 top-0 z-10 -translate-y-full border border-ink bg-paper px-3 py-2 focus:translate-y-4">
          {text.skip}
        </a>
        <Link href="/" className="min-w-0 break-words font-semibold">
          {name || '\u00a0'}
        </Link>
        <LanguageToggle lang={lang} label={text.languageToggle} />
      </div>
    </header>
  )
}
