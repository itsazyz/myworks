export function Feedback({ message, tone }: { message?: string; tone: 'success' | 'error' }) {
  if (!message) return null
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className="border border-ink bg-well px-3 py-2">
      {message}
    </p>
  )
}
