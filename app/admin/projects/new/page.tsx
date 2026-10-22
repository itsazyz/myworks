import { redirect } from 'next/navigation'
import { ProjectForm } from '@/components/project-form'
import { createProject } from '@/lib/actions/admin'
import { assertOwner } from '@/lib/auth'
import { messages } from '@/lib/i18n'
import { getLang } from '@/lib/lang'

export default async function NewProjectPage() {
  const gate = await assertOwner()
  if (!gate.ok) redirect('/login')
  const lang = getLang()
  return (
    <ProjectForm
      lang={lang}
      action={createProject}
      heading={messages[lang].newProject}
      lockSlug={false}
      initial={{
        slug: '',
        name_ar: '',
        name_en: '',
        desc_ar: '',
        desc_en: '',
        url: '',
        tags: [],
        shots: [],
        published: true,
      }}
    />
  )
}
