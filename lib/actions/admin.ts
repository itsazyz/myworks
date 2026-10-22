'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { assertOwner } from '@/lib/auth'
import type { ActionState } from '@/lib/action-state'
import { getLang } from '@/lib/lang'
import { messages } from '@/lib/i18n'
import { storagePathFromPublicUrl } from '@/lib/shots'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'
import {
  moveDirectionSchema,
  projectIdSchema,
  projectSchema,
  settingsSchema,
  toFieldErrors,
  type ProjectInput,
  type SettingsInput,
} from '@/lib/validation'

function failure(message: string, fieldErrors?: Record<string, string>): ActionState {
  return { status: 'error', message, fieldErrors }
}

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function listValue(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((item): item is string => typeof item === 'string')
}

function readProjectForm(formData: FormData) {
  return {
    slug: textValue(formData, 'slug'),
    name_ar: textValue(formData, 'name_ar'),
    name_en: textValue(formData, 'name_en'),
    desc_ar: textValue(formData, 'desc_ar'),
    desc_en: textValue(formData, 'desc_en'),
    url: textValue(formData, 'url'),
    tags: listValue(formData, 'tags'),
    shots: listValue(formData, 'shots'),
    published: formData.get('published') === 'on',
  }
}

function readSettingsForm(formData: FormData) {
  return {
    name_ar: textValue(formData, 'name_ar'),
    name_en: textValue(formData, 'name_en'),
    title_ar: textValue(formData, 'title_ar'),
    title_en: textValue(formData, 'title_en'),
    intro_ar: textValue(formData, 'intro_ar'),
    intro_en: textValue(formData, 'intro_en'),
    footer_ar: textValue(formData, 'footer_ar'),
    footer_en: textValue(formData, 'footer_en'),
    email: textValue(formData, 'email'),
    linkedin: textValue(formData, 'linkedin'),
    github: textValue(formData, 'github'),
  }
}

function revalidateProject(id?: string) {
  revalidatePath('/')
  revalidatePath('/admin')
  if (id) revalidatePath(`/admin/projects/${id}`)
}

async function removeStoredShots(urls: string[]) {
  const paths = urls.flatMap((url) => {
    const path = storagePathFromPublicUrl(url)
    return path ? [path] : []
  })
  if (paths.length === 0 || !hasSupabaseEnv()) return
  try {
    const supabase = createClient()
    await supabase.storage.from('project-shots').remove(paths)
  } catch {
    // The row is already updated. A leftover object can be removed later.
  }
}

function projectRow(input: ProjectInput, position: number) {
  return {
    slug: input.slug,
    name_ar: input.name_ar,
    name_en: input.name_en,
    desc_ar: input.desc_ar,
    desc_en: input.desc_en,
    url: input.url === '' ? null : input.url,
    tags: input.tags,
    shots: input.shots,
    position,
    published: input.published,
  }
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505'
}

async function requireId(id: string): Promise<ActionState | null> {
  const gate = await assertOwner()
  if (!gate.ok) return failure(gate.message)
  if (!projectIdSchema.safeParse(id).success) return failure(messages[getLang()].errorGeneric)
  return null
}

export async function createProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await assertOwner()
  const lang = getLang()
  const text = messages[lang]
  if (!gate.ok) return failure(gate.message)
  const parsed = projectSchema(lang).safeParse(readProjectForm(formData))
  if (!parsed.success) return failure(text.errorGeneric, toFieldErrors(parsed.error))

  const supabase = createClient()
  const existing = await supabase.from('projects').select('position').order('position', { ascending: false }).limit(1)
  if (existing.error) return failure(text.errorGeneric)
  const positions = z.array(z.object({ position: z.number() })).safeParse(existing.data)
  const position = positions.success && positions.data.length > 0 ? positions.data[0].position + 1 : 0
  const inserted = await supabase.from('projects').insert(projectRow(parsed.data, position))
  if (inserted.error) {
    if (isUniqueViolation(inserted.error)) return failure(text.errorGeneric, { slug: text.slugTaken })
    return failure(text.errorGeneric)
  }
  revalidateProject()
  redirect('/admin?notice=created')
}

export async function updateProject(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = await requireId(id)
  const lang = getLang()
  const text = messages[lang]
  if (blocked) return blocked
  const parsed = projectSchema(lang).safeParse(readProjectForm(formData))
  if (!parsed.success) return failure(text.errorGeneric, toFieldErrors(parsed.error))

  const supabase = createClient()
  const current = await supabase.from('projects').select('shots').eq('id', id).maybeSingle()
  if (current.error || !current.data) return failure(text.errorGeneric)
  const previous = z.object({ shots: z.array(z.string()).nullable() }).safeParse(current.data)
  const previousShots = previous.success ? previous.data.shots ?? [] : []
  const row = projectRow(parsed.data, 0)
  const updated = await supabase
    .from('projects')
    .update({
      slug: row.slug,
      name_ar: row.name_ar,
      name_en: row.name_en,
      desc_ar: row.desc_ar,
      desc_en: row.desc_en,
      url: row.url,
      tags: row.tags,
      shots: row.shots,
      published: row.published,
    })
    .eq('id', id)
  if (updated.error) {
    if (isUniqueViolation(updated.error)) return failure(text.errorGeneric, { slug: text.slugTaken })
    return failure(text.errorGeneric)
  }
  const removed = previousShots.filter((shot) => !parsed.data.shots.includes(shot))
  await removeStoredShots(removed)
  revalidateProject(id)
  return { status: 'success', message: text.saved }
}

export async function deleteProject(id: string): Promise<ActionState> {
  const blocked = await requireId(id)
  const text = messages[getLang()]
  if (blocked) return blocked
  const supabase = createClient()
  const current = await supabase.from('projects').select('shots').eq('id', id).maybeSingle()
  if (current.error || !current.data) return failure(text.errorGeneric)
  const previous = z.object({ shots: z.array(z.string()).nullable() }).safeParse(current.data)
  const deleted = await supabase.from('projects').delete().eq('id', id)
  if (deleted.error) return failure(text.errorGeneric)
  await removeStoredShots(previous.success ? previous.data.shots ?? [] : [])
  revalidateProject(id)
  return { status: 'success', message: text.deleted }
}

export async function togglePublished(id: string): Promise<ActionState> {
  const blocked = await requireId(id)
  const text = messages[getLang()]
  if (blocked) return blocked
  const supabase = createClient()
  const current = await supabase.from('projects').select('published').eq('id', id).maybeSingle()
  const parsed = z.object({ published: z.boolean() }).safeParse(current.data)
  if (current.error || !parsed.success) return failure(text.errorGeneric)
  const updated = await supabase.from('projects').update({ published: !parsed.data.published }).eq('id', id)
  if (updated.error) return failure(text.errorGeneric)
  revalidateProject(id)
  return { status: 'success', message: text.saved }
}

export async function moveProject(id: string, direction: 'up' | 'down'): Promise<ActionState> {
  const blocked = await requireId(id)
  const text = messages[getLang()]
  if (blocked) return blocked
  if (!moveDirectionSchema.safeParse(direction).success) return failure(text.errorGeneric)

  const supabase = createClient()
  const listed = await supabase
    .from('projects')
    .select('id, position')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  const rows = z.array(z.object({ id: z.string().uuid(), position: z.number() })).safeParse(listed.data)
  if (listed.error || !rows.success) return failure(text.errorGeneric)
  const index = rows.data.findIndex((row) => row.id === id)
  if (index < 0) return failure(text.errorGeneric)
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= rows.data.length) return failure(text.atEnd)

  const order = rows.data.map((row) => row.id)
  const [moved] = order.splice(index, 1)
  if (!moved) return failure(text.errorGeneric)
  order.splice(target, 0, moved)
  const updates = await Promise.all(
    order.map((projectId, position) => supabase.from('projects').update({ position }).eq('id', projectId)),
  )
  if (updates.some((result) => result.error)) return failure(text.errorGeneric)
  revalidateProject(id)
  return { status: 'success', message: text.saved }
}

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await assertOwner()
  const lang = getLang()
  const text = messages[lang]
  if (!gate.ok) return failure(gate.message)
  const parsed = settingsSchema(lang).safeParse(readSettingsForm(formData))
  if (!parsed.success) return failure(text.errorGeneric, toFieldErrors(parsed.error))
  const saved = await saveSettings(parsed.data)
  if (!saved) return failure(text.errorGeneric)
  revalidatePath('/')
  revalidatePath('/admin/settings')
  return { status: 'success', message: text.saved }
}

async function saveSettings(input: SettingsInput): Promise<boolean> {
  const supabase = createClient()
  const saved = await supabase.from('site_settings').upsert({ id: 1, ...input })
  return !saved.error
}

export async function logout() {
  if (hasSupabaseEnv()) {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // The redirect still ends the admin session in the browser.
    }
  }
  redirect('/login')
}
