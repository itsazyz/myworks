import Link from 'next/link'
import { logout } from '@/lib/actions/admin'
import { LanguageToggle } from '@/components/language-toggle'
import { textButtonClass } from '@/components/styles'
import { messages, type Lang } from '@/lib/i18n'

export function AdminHeader({ lang }: { lang: Lang }) {
  const text = messages[lang]
  return (
    <header className="relative border-b border-ink">
      <div className="mx-auto flex w-full max-w-page flex-wrap items-center justify-between gap-3 px-4 py-4">
        <a href="#content" className="absolute start-4 top-0 z-10 -translate-y-full border border-ink bg-paper px-3 py-2 focus:translate-y-4">
          {text.skip}
        </a>
        <nav className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/">{text.viewPublic}</Link>
          <Link href="/admin">{text.projects}</Link>
          <Link href="/admin/settings">{text.settings}</Link>
        </nav>
        <div className="flex flex-wrap items-center gap-4">
          <form action={logout}>
            <button type="submit" className={textButtonClass}>
              {text.logout}
            </button>
          </form>
          <LanguageToggle lang={lang} label={text.languageToggle} />
        </div>
      </div>
    </header>
  )
}
