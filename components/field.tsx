import type { ReactNode } from 'react'

export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function fieldAria(id: string, error?: string) {
  if (!error) return {}
  return { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` }
}
