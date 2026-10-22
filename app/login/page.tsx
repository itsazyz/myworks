import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/login-form'
import { SiteHeader } from '@/components/site-header'
import { siteCopy } from '@/lib/content'
import { getSettings } from '@/lib/data'
import { messages } from '@/lib/i18n'
import { getLang } from '@/lib/lang'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  const lang = getLang()
  const title = messages[lang].loginTitle
  return {
    title,
    robots: { index: false, follow: false },
    openGraph: { title },
  }
}

export default async function LoginPage() {
  const settingsPromise = getSettings()
  const lang = getLang()
  if (hasSupabaseEnv()) {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      const owner = await supabase.rpc('is_owner')
      if (owner.data === true) redirect('/admin')
      await supabase.auth.signOut()
    }
  }
  const settings = await settingsPromise
  const copy = siteCopy(settings, lang)
  const text = messages[lang]
  return (
    <>
      <SiteHeader lang={lang} name={copy.name} />
      <main id="content" className="mx-auto w-full max-w-page px-4 py-10">
        <h1 className="mb-6 text-2xl font-semibold">{text.loginTitle}</h1>
        <LoginForm lang={lang} />
      </main>
    </>
  )
}
