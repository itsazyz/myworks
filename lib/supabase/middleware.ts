import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseEnv } from '@/lib/supabase/env'

function isPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.search = ''
  return NextResponse.redirect(url)
}

function withSessionCookies(from: NextResponse, to: NextResponse) {
  from.headers.getSetCookie().forEach((cookie) => {
    to.headers.append('set-cookie', cookie)
  })
  return to
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname
  const adminPage = isPath(path, '/admin')
  const adminApi = isPath(path, '/api/admin')
  const env = supabaseEnv()

  if (!env) {
    if (adminApi) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    if (adminPage) return loginRedirect(request)
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!adminPage && !adminApi) return supabaseResponse

  if (!user) {
    const response = adminApi
      ? NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      : loginRedirect(request)
    return withSessionCookies(supabaseResponse, response)
  }

  const owner = await supabase.rpc('is_owner')
  if (owner.error || owner.data !== true) {
    await supabase.auth.signOut()
    const response = adminApi
      ? NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      : loginRedirect(request)
    return withSessionCookies(supabaseResponse, response)
  }

  return supabaseResponse
}
