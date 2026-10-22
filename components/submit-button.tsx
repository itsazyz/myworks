'use client'

import { useFormStatus } from 'react-dom'
import { buttonClass } from '@/components/styles'

export function SubmitButton({
  label,
  pendingLabel,
  disabled,
}: {
  label: string
  pendingLabel: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={buttonClass} disabled={pending || disabled === true}>
      {pending ? pendingLabel : label}
    </button>
  )
}
