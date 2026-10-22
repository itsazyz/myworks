import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/settings-form'
import { assertOwner } from '@/lib/auth'
import { getSettings } from '@/lib/data'
import { getLang } from '@/lib/lang'

export default async function SettingsPage() {
  const gate = await assertOwner()
  if (!gate.ok) redirect('/login')
  const lang = getLang()
  const settings = await getSettings()
  return <SettingsForm lang={lang} settings={settings} />
}
