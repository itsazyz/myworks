'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setLanguage } from '@/lib/actions/language'
import type { Lang } from '@/lib/i18n'
import { textButtonClass } from '@/components/styles'

export function LanguageToggle({ lang, label }: { lang: Lang; label: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const next: Lang = lang === 'ar' ? 'en' : 'ar'

  return (
    <button
      type="button"
      className={`${textButtonClass} shrink-0`}
      disabled={pending}
      onClick={() => {
        if (pending) return
        setPending(true)
        void setLanguage(next).then(() => {
          document.documentElement.lang = next
          document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
          router.refresh()
        })
      }}
    >
      {label}
    </button>
  )
}
