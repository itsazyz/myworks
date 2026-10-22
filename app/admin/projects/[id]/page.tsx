import { notFound, redirect } from 'next/navigation'
import { ProjectForm } from '@/components/project-form'
import { updateProject } from '@/lib/actions/admin'
import { assertOwner } from '@/lib/auth'
import { getProject } from '@/lib/data'
import { messages } from '@/lib/i18n'
import { getLang } from '@/lib/lang'
import { projectIdSchema } from '@/lib/validation'

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  if (!projectIdSchema.safeParse(params.id).success) notFound()
  const gate = await assertOwner()
  if (!gate.ok) redirect('/login')
  const project = await getProject(params.id)
  if (!project) notFound()
  const lang = getLang()
  return (
    <ProjectForm
      lang={lang}
      action={updateProject.bind(null, project.id)}
      heading={messages[lang].editProject}
      lockSlug
      initial={{
        slug: project.slug,
        name_ar: project.name_ar,
        name_en: project.name_en,
        desc_ar: project.desc_ar,
        desc_en: project.desc_en,
        url: project.url ?? '',
        tags: project.tags,
        shots: project.shots,
        published: project.published,
      }}
    />
  )
}
