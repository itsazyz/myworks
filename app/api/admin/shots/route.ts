import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { assertOwner } from '@/lib/auth'
import {
  isShotMime,
  matchesShotBytes,
  MAX_REQUEST_BYTES,
  MAX_SHOT_BYTES,
  SHOT_MIME,
  storagePathFromPublicUrl,
} from '@/lib/shots'
import { createClient } from '@/lib/supabase/server'
import { shotDeleteSchema } from '@/lib/validation'

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}

function tooLarge() {
  return NextResponse.json({ error: 'too-large' }, { status: 413 })
}

export async function POST(request: Request) {
  const gate = await assertOwner()
  if (!gate.ok) return unauthorized()
  const length = request.headers.get('content-length')
  if (length && Number(length) > MAX_REQUEST_BYTES) return tooLarge()

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return tooLarge()
  }
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'bad-request' }, { status: 400 })
  if (!isShotMime(file.type)) return NextResponse.json({ error: 'unsupported-type' }, { status: 415 })
  if (file.size <= 0 || file.size > MAX_SHOT_BYTES) return tooLarge()

  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!matchesShotBytes(file.type, bytes)) return NextResponse.json({ error: 'unsupported-type' }, { status: 415 })

  const path = `${gate.userId}/${crypto.randomUUID()}.${SHOT_MIME[file.type]}`
  const supabase = createClient()
  const uploaded = await supabase.storage.from('project-shots').upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  })
  if (uploaded.error) return NextResponse.json({ error: 'upload-failed' }, { status: 400 })
  const { data } = supabase.storage.from('project-shots').getPublicUrl(path)
  revalidatePath('/')
  revalidatePath('/admin')
  return NextResponse.json({ url: data.publicUrl })
}

export async function DELETE(request: Request) {
  const gate = await assertOwner()
  if (!gate.ok) return unauthorized()
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 })
  }
  const parsed = shotDeleteSchema.safeParse(payload)
  if (!parsed.success) return NextResponse.json({ error: 'bad-request' }, { status: 400 })
  const path = storagePathFromPublicUrl(parsed.data.url)
  if (!path) return NextResponse.json({ ok: true, removed: false })
  const supabase = createClient()
  const removed = await supabase.storage.from('project-shots').remove([path])
  if (removed.error) return NextResponse.json({ error: 'delete-failed' }, { status: 400 })
  revalidatePath('/')
  revalidatePath('/admin')
  return NextResponse.json({ ok: true, removed: true })
}
