import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseEnv } from '@/lib/supabase/env'

export function createClient() {
  const env = supabaseEnv()
  if (!env) {
    throw new Error('Supabase environment is not configured')
  }
  const cookieStore = cookies()
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot always write cookies. Middleware refreshes the session.
        }
      },
    },
  })
}
