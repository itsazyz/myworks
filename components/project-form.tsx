'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFormState } from 'react-dom'
import { Feedback } from '@/components/feedback'
import { Field, fieldAria } from '@/components/field'
import { SubmitButton } from '@/components/submit-button'
import { buttonClass, controlClass } from '@/components/styles'
import { initialActionState, type ActionState } from '@/lib/action-state'
import { isHttpUrl } from '@/lib/http'
import { messages, type Lang } from '@/lib/i18n'
import { isShotMime, MAX_SHOT_BYTES, storagePathFromPublicUrl } from '@/lib/shots'
import { slugify } from '@/lib/slug'
import { LIMITS } from '@/lib/validation'

export type ProjectFormValues = {
  slug: string
  name_ar: string
  name_en: string
  desc_ar: string
  desc_en: string
  url: string
  tags: string[]
  shots: string[]
  published: boolean
}

function isUrlPayload(value: unknown): value is { url: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    typeof value.url === 'string' &&
    isHttpUrl(value.url)
  )
}

export function ProjectForm({
  lang,
  action,
  initial,
  heading,
  lockSlug,
}: {
  lang: Lang
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  initial: ProjectFormValues
  heading: string
  lockSlug: boolean
}) {
  const text = messages[lang]
  const [state, formAction] = useFormState(action, initialActionState)
  const [nameEn, setNameEn] = useState(initial.name_en)
  const [slug, setSlug] = useState(initial.slug)
  const [slugEdited, setSlugEdited] = useState(lockSlug)
  const [tags, setTags] = useState(initial.tags)
  const [tagDraft, setTagDraft] = useState('')
  const [shots, setShots] = useState(initial.shots)
  const [shotDraft, setShotDraft] = useState('')
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const errors = state.fieldErrors ?? {}

  function addTag() {
    const value = tagDraft.trim()
    if (!value) return
    if (value.length > LIMITS.tag) {
      setLocalError(text.tooLong)
      return
    }
    if (tags.length >= LIMITS.tags) {
      setLocalError(text.tooManyTags)
      return
    }
    if (!tags.includes(value)) setTags([...tags, value])
    setTagDraft('')
    setLocalError(null)
  }

  function addShotUrl() {
    const value = shotDraft.trim()
    if (!isHttpUrl(value)) {
      setLocalError(text.invalidUrl)
      return
    }
    if (shots.length >= LIMITS.shots) {
      setLocalError(text.tooManyShots)
      return
    }
    if (!shots.includes(value)) setShots([...shots, value])
    setShotDraft('')
    setLocalError(null)
  }

  function moveShot(index: number, delta: number) {
    setShots((current) => {
      const target = index + delta
      if (target < 0 || target >= current.length) return current
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      if (!item) return current
      copy.splice(target, 0, item)
      return copy
    })
  }

  async function removeShot(url: string, index: number) {
    setShots((current) => current.filter((_, itemIndex) => itemIndex !== index))
    if (!storagePathFromPublicUrl(url)) return
    const response = await fetch('/api/admin/shots', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    if (!response.ok) {
      setShots((current) => {
        const copy = [...current]
        copy.splice(index, 0, url)
        return copy
      })
      setLocalError(text.uploadFailed)
    }
  }

  async function uploadFiles(list: FileList | null) {
    if (!list || uploading) return
    setUploading(true)
    setLocalError(null)
    let next = shots
    try {
      for (const file of Array.from(list)) {
        if (next.length >= LIMITS.shots) {
          setLocalError(text.tooManyShots)
          break
        }
        if (!isShotMime(file.type)) {
          setLocalError(text.fileType)
          continue
        }
        if (file.size > MAX_SHOT_BYTES) {
          setLocalError(text.fileSize)
          continue
        }
        const body = new FormData()
        body.set('file', file)
        const response = await fetch('/api/admin/shots', { method: 'POST', body })
        let payload: unknown = null
        try {
          payload = await response.json()
        } catch {
          payload = null
        }
        if (response.status === 413) {
          setLocalError(text.fileSize)
          continue
        }
        if (response.status === 415) {
          setLocalError(text.fileType)
          continue
        }
        if (!response.ok || !isUrlPayload(payload)) {
          setLocalError(text.uploadFailed)
          continue
        }
        next = [...next, payload.url]
        setShots(next)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      action={formAction}
      className="grid gap-4"
      noValidate
      onSubmit={(event) => {
        if (uploading) event.preventDefault()
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{heading}</h1>
        <Link href="/admin">{text.backToProjects}</Link>
      </div>
      <Feedback message={state.status === 'success' ? state.message : undefined} tone="success" />
      <Feedback message={state.status === 'error' ? state.message : undefined} tone="error" />
      <Feedback message={localError ?? undefined} tone="error" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name_ar" label={text.nameAr} error={errors.name_ar}>
          <input
            id="name_ar"
            name="name_ar"
            dir="rtl"
            maxLength={LIMITS.name}
            defaultValue={initial.name_ar}
            className={controlClass}
            {...fieldAria('name_ar', errors.name_ar)}
          />
        </Field>
        <Field id="name_en" label={text.nameEn} error={errors.name_en}>
          <input
            id="name_en"
            name="name_en"
            dir="ltr"
            maxLength={LIMITS.name}
            value={nameEn}
            className={controlClass}
            {...fieldAria('name_en', errors.name_en)}
            onChange={(event) => {
              const value = event.target.value
              setNameEn(value)
              if (!slugEdited) setSlug(slugify(value))
            }}
          />
        </Field>
      </div>
      <Field id="slug" label={text.slug} error={errors.slug}>
        <input
          id="slug"
          name="slug"
          dir="ltr"
          maxLength={LIMITS.slug}
          value={slug}
          spellCheck={false}
          className={controlClass}
          {...fieldAria('slug', errors.slug)}
          onChange={(event) => {
            setSlugEdited(true)
            setSlug(event.target.value)
          }}
        />
      </Field>
      <Field id="desc_ar" label={text.descAr} error={errors.desc_ar}>
        <textarea
          id="desc_ar"
          name="desc_ar"
          dir="rtl"
          rows={5}
          maxLength={LIMITS.description}
          defaultValue={initial.desc_ar}
          className={controlClass}
          {...fieldAria('desc_ar', errors.desc_ar)}
        />
      </Field>
      <Field id="desc_en" label={text.descEn} error={errors.desc_en}>
        <textarea
          id="desc_en"
          name="desc_en"
          dir="ltr"
          rows={5}
          maxLength={LIMITS.description}
          defaultValue={initial.desc_en}
          className={controlClass}
          {...fieldAria('desc_en', errors.desc_en)}
        />
      </Field>
      <Field id="url" label={text.url} error={errors.url}>
        <input
          id="url"
          name="url"
          dir="ltr"
          inputMode="url"
          maxLength={LIMITS.shot}
          placeholder={text.urlPlaceholder}
          defaultValue={initial.url}
          className={controlClass}
          {...fieldAria('url', errors.url)}
        />
      </Field>
      <fieldset className="grid min-w-0 gap-2">
        <legend>{text.tags}</legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={tagDraft}
            maxLength={LIMITS.tag}
            placeholder={text.tagPlaceholder}
            className={controlClass}
            onChange={(event) => setTagDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addTag()
              }
            }}
          />
          <button type="button" className={buttonClass} onClick={addTag}>
            {text.addTag}
          </button>
        </div>
        {errors.tags ? <p className="text-sm">{errors.tags}</p> : null}
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <li key={`${tag}-${index}`} className="flex items-center gap-2 border border-ink px-2 py-1">
              <span className="break-words">{tag}</span>
              <button type="button" className="underline underline-offset-4" onClick={() => setTags(tags.filter((_, itemIndex) => itemIndex !== index))}>
                {text.removeTag}
              </button>
              <input type="hidden" name="tags" value={tag} />
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset className="grid min-w-0 gap-3">
        <legend>{text.shots}</legend>
        <label htmlFor="shot-files" className="block">
          {uploading ? text.uploading : text.upload}
        </label>
        <input
          id="shot-files"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={uploading}
          className={`${controlClass} file:rounded-none file:border-0 file:bg-paper file:text-ink`}
          onChange={(event) => {
            void uploadFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={shotDraft}
            dir="ltr"
            inputMode="url"
            maxLength={LIMITS.shot}
            placeholder={text.urlPlaceholder}
            className={controlClass}
            onChange={(event) => setShotDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addShotUrl()
              }
            }}
          />
          <button type="button" className={buttonClass} onClick={addShotUrl}>
            {text.addUrl}
          </button>
        </div>
        {errors.shots ? <p className="text-sm">{errors.shots}</p> : null}
        <ul className="grid gap-3">
          {shots.map((shot, index) => (
            <li key={`${shot}-${index}`} className="flex min-w-0 flex-col gap-2 border border-ink p-2 sm:flex-row sm:items-center">
              {isHttpUrl(shot) ? (
                <img src={shot} alt="" className="aspect-[16/10] w-full object-cover sm:w-32" />
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-well text-sm text-muted sm:w-32">{text.noScreenshot}</div>
              )}
              <p dir="ltr" className="min-w-0 flex-1 break-all text-sm">
                {shot}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={buttonClass} disabled={index === 0} onClick={() => moveShot(index, -1)}>
                  {text.moveShotUp}
                </button>
                <button type="button" className={buttonClass} disabled={index === shots.length - 1} onClick={() => moveShot(index, 1)}>
                  {text.moveShotDown}
                </button>
                <button type="button" className={buttonClass} onClick={() => void removeShot(shot, index)}>
                  {text.removeShot}
                </button>
              </div>
              <input type="hidden" name="shots" value={shot} />
            </li>
          ))}
        </ul>
      </fieldset>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="published" defaultChecked={initial.published} />
        {text.publishedField}
      </label>
      <SubmitButton label={text.save} pendingLabel={text.saving} disabled={uploading} />
    </form>
  )
}
