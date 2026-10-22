import type { Lang } from '@/lib/i18n'
import { messages } from '@/lib/i18n'
import type { Project, SiteSettings } from '@/lib/types'

export function siteCopy(settings: SiteSettings, lang: Lang) {
  if (lang === 'ar') {
    return {
      name: settings.name_ar,
      title: settings.title_ar,
      intro: settings.intro_ar,
      footer: settings.footer_ar,
    }
  }
  return {
    name: settings.name_en,
    title: settings.title_en,
    intro: settings.intro_en,
    footer: settings.footer_en,
  }
}

export function documentTitle(settings: SiteSettings, lang: Lang): string {
  const copy = siteCopy(settings, lang)
  const parts = [copy.name, copy.title].map((part) => part.trim()).filter((part) => part.length > 0)
  if (parts.length > 0) return parts.join(' — ')
  return messages[lang].fallbackTitle
}

export function projectCopy(project: Project, lang: Lang) {
  if (lang === 'ar') {
    return { name: project.name_ar, description: project.desc_ar }
  }
  return { name: project.name_en, description: project.desc_en }
}
