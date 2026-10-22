import { cache } from 'react'
import { getLang } from '@/lib/lang'
import { messages } from '@/lib/i18n'
import { hasSupabaseEnv } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'

export type OwnerGate = { ok: true; userId: string } | { ok: false; message: string }

export const assertOwner = cache(async (): Promise<OwnerGate> => {
  const message = messages[getLang()].unauthorized
  if (!hasSupabaseEnv()) return { ok: false, message }
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return { ok: false, message }
    const owner = await supabase.rpc('is_owner')
    if (owner.error || owner.data !== true) {
      await supabase.auth.signOut()
      return { ok: false, message }
    }
    return { ok: true, userId: data.user.id }
  } catch {
    return { ok: false, message }
  }
})
