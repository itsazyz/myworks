import { cookies } from 'next/headers'
import type { Lang } from '@/lib/i18n'

export function getLang(): Lang {
  const value = cookies().get('lang')?.value
  return value === 'en' ? 'en' : 'ar'
}
