import { z } from 'zod'
import { isEmail, isHttpUrl } from '@/lib/http'
import type { Lang } from '@/lib/i18n'
import { messages } from '@/lib/i18n'

export const LIMITS = {
  slug: 80,
  name: 120,
  description: 2000,
  footer: 300,
  tag: 40,
  tags: 12,
  shot: 2000,
  shots: 8,
  email: 200,
} as const

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && fieldErrors[key] === undefined) {
      fieldErrors[key] = issue.message
    }
  }
  return fieldErrors
}

export function projectSchema(lang: Lang) {
  const text = messages[lang]
  return z.object({
    slug: z
      .string()
      .trim()
      .min(1, text.required)
      .max(LIMITS.slug, text.tooLong)
      .regex(slugPattern, text.invalidSlug),
    name_ar: z.string().trim().min(1, text.required).max(LIMITS.name, text.tooLong),
    name_en: z.string().trim().min(1, text.required).max(LIMITS.name, text.tooLong),
    desc_ar: z.string().trim().max(LIMITS.description, text.tooLong),
    desc_en: z.string().trim().max(LIMITS.description, text.tooLong),
    url: z
      .string()
      .trim()
      .max(LIMITS.shot, text.tooLong)
      .refine((value) => value === '' || isHttpUrl(value), text.invalidUrl),
    tags: z.array(z.string().trim().min(1, text.required).max(LIMITS.tag, text.tooLong)).max(LIMITS.tags, text.tooManyTags),
    shots: z
      .array(z.string().trim().max(LIMITS.shot, text.tooLong).refine(isHttpUrl, text.invalidUrl))
      .max(LIMITS.shots, text.tooManyShots),
    published: z.boolean(),
  })
}

export function settingsSchema(lang: Lang) {
  const text = messages[lang]
  return z.object({
    name_ar: z.string().trim().max(LIMITS.name, text.tooLong),
    name_en: z.string().trim().max(LIMITS.name, text.tooLong),
    title_ar: z.string().trim().max(LIMITS.name, text.tooLong),
    title_en: z.string().trim().max(LIMITS.name, text.tooLong),
    intro_ar: z.string().trim().max(LIMITS.description, text.tooLong),
    intro_en: z.string().trim().max(LIMITS.description, text.tooLong),
    footer_ar: z.string().trim().max(LIMITS.footer, text.tooLong),
    footer_en: z.string().trim().max(LIMITS.footer, text.tooLong),
    email: z
      .string()
      .trim()
      .max(LIMITS.email, text.tooLong)
      .refine((value) => value === '' || isEmail(value), text.invalidEmail),
    linkedin: z
      .string()
      .trim()
      .max(LIMITS.shot, text.tooLong)
      .refine((value) => value === '' || isHttpUrl(value), text.invalidUrl),
    github: z
      .string()
      .trim()
      .max(LIMITS.shot, text.tooLong)
      .refine((value) => value === '' || isHttpUrl(value), text.invalidUrl),
  })
}

export const projectIdSchema = z.string().uuid()

export const moveDirectionSchema = z.enum(['up', 'down'])

export const shotDeleteSchema = z.object({
  url: z.string().trim().max(LIMITS.shot).refine(isHttpUrl),
})

export type ProjectInput = z.infer<ReturnType<typeof projectSchema>>
export type SettingsInput = z.infer<ReturnType<typeof settingsSchema>>
