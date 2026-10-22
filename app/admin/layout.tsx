import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin-header'
import { assertOwner } from '@/lib/auth'
import { messages } from '@/lib/i18n'
import { getLang } from '@/lib/lang'

export async function generateMetadata(): Promise<Metadata> {
  const lang = getLang()
  const title = messages[lang].adminTitle
  return {
    title,
    robots: { index: false, follow: false },
    openGraph: { title },
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const lang = getLang()
  const gate = await assertOwner()
  if (!gate.ok) redirect('/login')
  return (
    <>
      <AdminHeader lang={lang} />
      <main id="content" className="mx-auto w-full max-w-page px-4 py-8">
        {children}
      </main>
    </>
  )
}
