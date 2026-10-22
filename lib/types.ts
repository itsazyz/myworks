export type Project = {
  id: string
  slug: string
  name_ar: string
  name_en: string
  desc_ar: string
  desc_en: string
  url: string | null
  tags: string[]
  shots: string[]
  position: number
  published: boolean
  created_at: string
  updated_at: string
}

export type SiteSettings = {
  name_ar: string
  name_en: string
  title_ar: string
  title_en: string
  intro_ar: string
  intro_en: string
  footer_ar: string
  footer_en: string
  email: string
  linkedin: string
  github: string
}

export const emptySettings: SiteSettings = {
  name_ar: '',
  name_en: '',
  title_ar: '',
  title_en: '',
  intro_ar: '',
  intro_en: '',
  footer_ar: '',
  footer_en: '',
  email: '',
  linkedin: '',
  github: '',
}
