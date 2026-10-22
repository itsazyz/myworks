import { ProjectMedia } from '@/components/project-media'
import { isHttpUrl } from '@/lib/http'
import { messages, type Lang } from '@/lib/i18n'
import type { Project } from '@/lib/types'
import { projectCopy } from '@/lib/content'

export function ProjectRow({ project, lang, frameFirst }: { project: Project; lang: Lang; frameFirst: boolean }) {
  const text = messages[lang]
  const copy = projectCopy(project, lang)
  const url = project.url && isHttpUrl(project.url) ? project.url : null
  const shots = project.shots.filter(isHttpUrl)
  const media = (
    <ProjectMedia
      shots={shots}
      name={copy.name}
      emptyLabel={text.noScreenshot}
      address={url ?? ''}
      thumbLabels={shots.map((_, index) => text.shotAlt(copy.name, index))}
    />
  )
  const details = (
    <div className="min-w-0">
      <h2 className="break-words text-2xl font-semibold">{copy.name}</h2>
      {copy.description ? <p className="mt-3 whitespace-pre-wrap break-words text-muted">{copy.description}</p> : null}
      {project.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag, index) => (
            <li key={`${tag}-${index}`} className="break-words border border-ink px-2 py-1 text-sm">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {text.visitSite}
          </a>
        ) : (
          <button type="button" aria-disabled="true" disabled className="cursor-not-allowed border border-muted px-3 py-2 text-muted">
            {text.linkSoon}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <article className="grid grid-cols-1 gap-6 border-t border-ink py-8 md:grid-cols-2 md:items-start md:gap-10">
      {frameFirst ? (
        <>
          <div className="min-w-0">{media}</div>
          {details}
        </>
      ) : (
        <>
          {details}
          <div className="min-w-0">{media}</div>
        </>
      )}
    </article>
  )
}
