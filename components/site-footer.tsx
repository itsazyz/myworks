import Link from 'next/link'
import { isEmail, isHttpUrl } from '@/lib/http'
import { messages, type Lang } from '@/lib/i18n'
import type { SiteSettings } from '@/lib/types'

export function SiteFooter({ lang, settings, footer }: { lang: Lang; settings: SiteSettings; footer: string }) {
  const text = messages[lang]
  const email = isEmail(settings.email) ? settings.email : ''
  const linkedin = isHttpUrl(settings.linkedin) ? settings.linkedin : ''
  const github = isHttpUrl(settings.github) ? settings.github : ''
  const hasContact = email.length > 0 || linkedin.length > 0 || github.length > 0

  return (
    <footer className="border-t border-ink">
      <div className="mx-auto flex w-full max-w-page flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-6 text-sm">
        {footer.trim() ? <p className="min-w-0 whitespace-pre-wrap break-words">{footer}</p> : null}
        {hasContact ? (
          <ul className="flex min-w-0 flex-wrap gap-x-4 gap-y-2">
            {email ? (
              <li>
                <a href={`mailto:${email}`} dir="ltr">
                  {email}
                </a>
              </li>
            ) : null}
            {linkedin ? (
              <li>
                <a href={linkedin} target="_blank" rel="noopener noreferrer">
                  {text.linkedin}
                </a>
              </li>
            ) : null}
            {github ? (
              <li>
                <a href={github} target="_blank" rel="noopener noreferrer">
                  {text.github}
                </a>
              </li>
            ) : null}
          </ul>
        ) : null}
        <Link href="/login" className="text-muted">
          {text.ownerLogin}
        </Link>
      </div>
    </footer>
  )
}
