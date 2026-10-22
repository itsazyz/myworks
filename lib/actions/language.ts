'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Lang } from '@/lib/i18n'

export async function setLanguage(lang: Lang) {
  if (lang !== 'ar' && lang !== 'en') return
  cookies().set('lang', lang, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  })
  revalidatePath('/', 'layout')
}
