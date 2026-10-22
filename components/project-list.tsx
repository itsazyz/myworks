'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteProject, moveProject, togglePublished } from '@/lib/actions/admin'
import type { ActionState } from '@/lib/action-state'
import { Feedback } from '@/components/feedback'
import { buttonClass } from '@/components/styles'
import { isHttpUrl } from '@/lib/http'
import { messages, type Lang } from '@/lib/i18n'
import { projectCopy } from '@/lib/content'
import type { Project } from '@/lib/types'

export function ProjectList({
  lang,
  projects,
  initialNotice,
  failed,
}: {
  lang: Lang
  projects: Project[]
  initialNotice: string | null
  failed: boolean
}) {
  const text = messages[lang]
  const [notice, setNotice] = useState(initialNotice)
  const [error, setError] = useState<string | null>(failed ? text.loadError : null)
  const [pending, setPending] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function run(action: () => Promise<ActionState>) {
    if (pending) return
    setPending(true)
    try {
      const result = await action()
      if (result.status === 'success') {
        setError(null)
        setNotice(result.message ?? null)
        setConfirmId(null)
      } else {
        setNotice(null)
        setError(result.message ?? text.errorGeneric)
      }
    } catch {
      setNotice(null)
      setError(text.errorGeneric)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{text.projects}</h1>
        <Link href="/admin/projects/new" className={buttonClass}>
          {text.newProject}
        </Link>
      </div>
      <Feedback message={notice ?? undefined} tone="success" />
      <Feedback message={error ?? undefined} tone="error" />
      {!failed && projects.length === 0 ? (
        <p className="border border-ink bg-well px-4 py-8 text-center">{text.emptyProjects}</p>
      ) : null}
      <ul className="grid gap-3">
        {projects.map((project, index) => {
          const copy = projectCopy(project, lang)
          const shot = project.shots.find(isHttpUrl) ?? null
          return (
            <li key={project.id} className="min-w-0 border border-ink p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="aspect-[16/10] w-full overflow-hidden border border-ink bg-well sm:w-36 sm:shrink-0">
                  {shot ? (
                    <img src={shot} alt={copy.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-sm text-muted">{text.noScreenshot}</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words font-semibold">{copy.name}</p>
                  <p className="mt-1">
                    <span className="inline-block border border-ink px-2 py-1 text-sm">
                      {project.published ? text.published : text.hidden}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/projects/${project.id}`} className={buttonClass}>
                    {text.edit}
                  </Link>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={pending}
                    onClick={() => run(() => togglePublished(project.id))}
                  >
                    {project.published ? text.hide : text.publish}
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={pending || index === 0}
                    aria-label={`${text.moveUp} ${copy.name}`}
                    onClick={() => run(() => moveProject(project.id, 'up'))}
                  >
                    {text.moveUp}
                  </button>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={pending || index === projects.length - 1}
                    aria-label={`${text.moveDown} ${copy.name}`}
                    onClick={() => run(() => moveProject(project.id, 'down'))}
                  >
                    {text.moveDown}
                  </button>
                  {confirmId === project.id ? (
                    <>
                      <p className="w-full text-sm">{text.confirmPrompt}</p>
                      <button
                        type="button"
                        className={buttonClass}
                        disabled={pending}
                        onClick={() => run(() => deleteProject(project.id))}
                      >
                        {text.confirmDelete}
                      </button>
                      <button type="button" className={buttonClass} disabled={pending} onClick={() => setConfirmId(null)}>
                        {text.cancel}
                      </button>
                    </>
                  ) : (
                    <button type="button" className={buttonClass} disabled={pending} onClick={() => setConfirmId(project.id)}>
                      {text.delete}
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
