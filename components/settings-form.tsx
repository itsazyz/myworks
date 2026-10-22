'use client'

import Link from 'next/link'
import { useFormState } from 'react-dom'
import { updateSettings } from '@/lib/actions/admin'
import { initialActionState } from '@/lib/action-state'
import { Feedback } from '@/components/feedback'
import { Field, fieldAria } from '@/components/field'
import { SubmitButton } from '@/components/submit-button'
import { controlClass } from '@/components/styles'
import { messages, type Lang } from '@/lib/i18n'
import type { SiteSettings } from '@/lib/types'
import { LIMITS } from '@/lib/validation'

export function SettingsForm({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const text = messages[lang]
  const [state, formAction] = useFormState(updateSettings, initialActionState)
  const errors = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{text.settingsTitle}</h1>
        <Link href="/admin">{text.backToProjects}</Link>
      </div>
      <Feedback message={state.status === 'success' ? state.message : undefined} tone="success" />
      <Feedback message={state.status === 'error' ? state.message : undefined} tone="error" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name_ar" label={text.nameAr} error={errors.name_ar}>
          <input id="name_ar" name="name_ar" dir="rtl" maxLength={LIMITS.name} defaultValue={settings.name_ar} className={controlClass} {...fieldAria('name_ar', errors.name_ar)} />
        </Field>
        <Field id="name_en" label={text.nameEn} error={errors.name_en}>
          <input id="name_en" name="name_en" dir="ltr" maxLength={LIMITS.name} defaultValue={settings.name_en} className={controlClass} {...fieldAria('name_en', errors.name_en)} />
        </Field>
        <Field id="title_ar" label={text.titleAr} error={errors.title_ar}>
          <input id="title_ar" name="title_ar" dir="rtl" maxLength={LIMITS.name} defaultValue={settings.title_ar} className={controlClass} {...fieldAria('title_ar', errors.title_ar)} />
        </Field>
        <Field id="title_en" label={text.titleEn} error={errors.title_en}>
          <input id="title_en" name="title_en" dir="ltr" maxLength={LIMITS.name} defaultValue={settings.title_en} className={controlClass} {...fieldAria('title_en', errors.title_en)} />
        </Field>
      </div>
      <Field id="intro_ar" label={text.introAr} error={errors.intro_ar}>
        <textarea id="intro_ar" name="intro_ar" dir="rtl" rows={4} maxLength={LIMITS.description} defaultValue={settings.intro_ar} className={controlClass} {...fieldAria('intro_ar', errors.intro_ar)} />
      </Field>
      <Field id="intro_en" label={text.introEn} error={errors.intro_en}>
        <textarea id="intro_en" name="intro_en" dir="ltr" rows={4} maxLength={LIMITS.description} defaultValue={settings.intro_en} className={controlClass} {...fieldAria('intro_en', errors.intro_en)} />
      </Field>
      <Field id="footer_ar" label={text.footerAr} error={errors.footer_ar}>
        <textarea id="footer_ar" name="footer_ar" dir="rtl" rows={3} maxLength={LIMITS.footer} defaultValue={settings.footer_ar} className={controlClass} {...fieldAria('footer_ar', errors.footer_ar)} />
      </Field>
      <Field id="footer_en" label={text.footerEn} error={errors.footer_en}>
        <textarea id="footer_en" name="footer_en" dir="ltr" rows={3} maxLength={LIMITS.footer} defaultValue={settings.footer_en} className={controlClass} {...fieldAria('footer_en', errors.footer_en)} />
      </Field>
      <Field id="email" label={text.email} error={errors.email}>
        <input id="email" name="email" type="email" dir="ltr" autoComplete="email" maxLength={LIMITS.email} defaultValue={settings.email} className={controlClass} {...fieldAria('email', errors.email)} />
      </Field>
      <Field id="linkedin" label={text.linkedin} error={errors.linkedin}>
        <input id="linkedin" name="linkedin" dir="ltr" inputMode="url" maxLength={LIMITS.shot} defaultValue={settings.linkedin} className={controlClass} {...fieldAria('linkedin', errors.linkedin)} />
      </Field>
      <Field id="github" label={text.github} error={errors.github}>
        <input id="github" name="github" dir="ltr" inputMode="url" maxLength={LIMITS.shot} defaultValue={settings.github} className={controlClass} {...fieldAria('github', errors.github)} />
      </Field>
      <SubmitButton label={text.save} pendingLabel={text.saving} />
    </form>
  )
}
