import { redirect } from 'next/navigation'
import { ProjectList } from '@/components/project-list'
import { assertOwner } from '@/lib/auth'
import { getAllProjects } from '@/lib/data'
import { messages } from '@/lib/i18n'
import { getLang } from '@/lib/lang'

function noticeText(value: string | string[] | undefined, created: string): string | null {
  const notice = Array.isArray(value) ? value[0] : value
  return notice === 'created' ? created : null
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { notice?: string | string[] }
}) {
  const gate = await assertOwner()
  if (!gate.ok) redirect('/login')
  const lang = getLang()
  const loaded = await getAllProjects()
  return (
    <ProjectList
      lang={lang}
      projects={loaded.projects}
      failed={loaded.failed}
      initialNotice={noticeText(searchParams.notice, messages[lang].created)}
    />
  )
}
