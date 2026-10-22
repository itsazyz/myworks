import { ProjectRow } from '@/components/project-row'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { siteCopy } from '@/lib/content'
import { getPublishedProjects, getSettings } from '@/lib/data'
import { messages } from '@/lib/i18n'
import { getLang } from '@/lib/lang'

export default async function HomePage() {
  const lang = getLang()
  const text = messages[lang]
  const [settings, projects] = await Promise.all([getSettings(), getPublishedProjects()])
  const copy = siteCopy(settings, lang)

  return (
    <>
      <SiteHeader lang={lang} name={copy.name} />
      <main id="content">
        <section className="mx-auto w-full max-w-page px-4 py-10">
          <h1 className="break-words text-3xl font-semibold sm:text-4xl">{copy.name || '\u00a0'}</h1>
          {copy.title ? <p className="mt-2 text-lg">{copy.title}</p> : null}
          {copy.intro ? <p className="mt-4 max-w-2xl whitespace-pre-wrap break-words text-muted">{copy.intro}</p> : null}
          <p className="mt-6">{text.publishedCount(projects.length)}</p>
        </section>
        <div className="mx-auto w-full max-w-page px-4 pb-12">
          {projects.length === 0 ? (
            <p className="border border-ink bg-well px-4 py-8 text-center">{text.emptyProjects}</p>
          ) : (
            projects.map((project, index) => (
              <ProjectRow key={project.id} project={project} lang={lang} frameFirst={index % 2 === 0} />
            ))
          )}
        </div>
      </main>
      <SiteFooter lang={lang} settings={settings} footer={copy.footer} />
    </>
  )
}
