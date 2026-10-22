import { cache } from 'react'
import { z } from 'zod'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'
import { emptySettings, type Project, type SiteSettings } from '@/lib/types'

const textValue = z
  .string()
  .nullable()
  .optional()
  .transform((value) => value ?? '')

const projectRowSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name_ar: textValue,
  name_en: textValue,
  desc_ar: textValue,
  desc_en: textValue,
  url: z.string().nullable().optional().transform((value) => value ?? null),
  tags: z.array(z.string()).nullable().optional().transform((value) => value ?? []),
  shots: z.array(z.string()).nullable().optional().transform((value) => value ?? []),
  position: z.number(),
  published: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

const settingsRowSchema = z.object({
  name_ar: textValue,
  name_en: textValue,
  title_ar: textValue,
  title_en: textValue,
  intro_ar: textValue,
  intro_en: textValue,
  footer_ar: textValue,
  footer_en: textValue,
  email: textValue,
  linkedin: textValue,
  github: textValue,
})

function parseProjects(input: unknown): Project[] {
  const rows = z.array(z.unknown()).safeParse(input)
  if (!rows.success) return []
  const projects: Project[] = []
  for (const row of rows.data) {
    const parsed = projectRowSchema.safeParse(row)
    if (parsed.success) projects.push(parsed.data)
  }
  return projects
}

function parseSettings(input: unknown): SiteSettings {
  const parsed = settingsRowSchema.safeParse(input)
  return parsed.success ? parsed.data : emptySettings
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!hasSupabaseEnv()) return emptySettings
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
    if (error || !data) return emptySettings
    return parseSettings(data)
  } catch {
    return emptySettings
  }
})

export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  if (!hasSupabaseEnv()) return []
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) return []
    return parseProjects(data).filter((project) => project.published)
  } catch {
    return []
  }
})

export const getAllProjects = cache(async (): Promise<{ projects: Project[]; failed: boolean }> => {
  if (!hasSupabaseEnv()) return { projects: [], failed: true }
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) return { projects: [], failed: true }
    return { projects: parseProjects(data), failed: false }
  } catch {
    return { projects: [], failed: true }
  }
})

export const getProject = cache(async (id: string): Promise<Project | null> => {
  if (!z.string().uuid().safeParse(id).success || !hasSupabaseEnv()) return null
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    const parsed = projectRowSchema.safeParse(data)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
})
