'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { buttonClass, controlClass } from '@/components/styles'
import { Field } from '@/components/field'
import { Feedback } from '@/components/feedback'
import { messages, type Lang } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'myworks-login-failures'
const LOCK_MS = 60_000

type StoredFailures = {
  v: 1
  count: number
  lockedUntil: number
}

function readFailures(): StoredFailures {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { v: 1, count: 0, lockedUntil: 0 }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { v: 1, count: 0, lockedUntil: 0 }
    if (!('v' in parsed) || parsed.v !== 1) return { v: 1, count: 0, lockedUntil: 0 }
    const count = 'count' in parsed && typeof parsed.count === 'number' ? parsed.count : 0
    const lockedUntil = 'lockedUntil' in parsed && typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : 0
    return { v: 1, count, lockedUntil }
  } catch {
    return { v: 1, count: 0, lockedUntil: 0 }
  }
}

function writeFailures(value: StoredFailures) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Storage can be unavailable. The in-page lock still applies for this view.
  }
}

function noteFailure(): { locked: boolean } {
  const current = readFailures()
  const now = Date.now()
  if (current.lockedUntil > now) return { locked: true }
  const count = current.count + 1
  if (count >= 5) {
    writeFailures({ v: 1, count: 0, lockedUntil: now + LOCK_MS })
    return { locked: true }
  }
  writeFailures({ v: 1, count, lockedUntil: 0 })
  return { locked: false }
}

export function LoginForm({ lang }: { lang: Lang }) {
  const text = messages[lang]
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [locked, setLocked] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const stored = readFailures()
    const remaining = stored.lockedUntil - Date.now()
    if (remaining > 0) {
      setLocked(true)
      setMessage(text.loginLocked)
      timer.current = setTimeout(() => {
        setLocked(false)
        setMessage(null)
      }, remaining)
    }
    return () => {
      if (timer.current !== null) clearTimeout(timer.current)
    }
  }, [text.loginLocked])

  function fail() {
    const result = noteFailure()
    if (result.locked) {
      setLocked(true)
      setMessage(text.loginLocked)
      if (timer.current !== null) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        setLocked(false)
        setMessage(null)
      }, LOCK_MS)
      return
    }
    setMessage(text.loginFailed)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || locked) return
    const stored = readFailures()
    if (stored.lockedUntil > Date.now()) {
      setLocked(true)
      setMessage(text.loginLocked)
      return
    }
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    setPending(true)
    setMessage(null)
    try {
      const supabase = createClient()
      if (!supabase) {
        fail()
        return
      }
      const signedIn = await supabase.auth.signInWithPassword({ email, password })
      if (signedIn.error) {
        fail()
        return
      }
      const owner = await supabase.rpc('is_owner')
      if (owner.error || owner.data !== true) {
        await supabase.auth.signOut()
        fail()
        return
      }
      sessionStorage.removeItem(STORAGE_KEY)
      router.push('/admin')
      router.refresh()
    } catch {
      fail()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-4 border border-ink p-4" noValidate>
      <Feedback message={message ?? undefined} tone="error" />
      <Field id="email" label={text.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          dir="ltr"
          className={controlClass}
        />
      </Field>
      <Field id="password" label={text.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className={controlClass}
        />
      </Field>
      <button type="submit" className={buttonClass} disabled={pending || locked}>
        {text.signIn}
      </button>
    </form>
  )
}
