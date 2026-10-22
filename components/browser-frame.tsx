import type { ReactNode } from 'react'

export function BrowserFrame({
  address,
  image,
  thumbs,
}: {
  address: string
  image: ReactNode
  thumbs?: ReactNode
}) {
  return (
    <div className="min-w-0 border border-ink bg-paper">
      <div className="flex items-center gap-3 border-b border-ink bg-well px-3 py-2">
        <span className="flex shrink-0 gap-1" aria-hidden="true">
          <span className="block h-2 w-2 bg-ink" />
          <span className="block h-2 w-2 bg-ink" />
          <span className="block h-2 w-2 bg-ink" />
        </span>
        <p
          dir="ltr"
          className="min-w-0 flex-1 truncate border border-ink bg-paper px-2 py-1 text-left text-sm text-muted"
          title={address || undefined}
        >
          {address || '\u00a0'}
        </p>
      </div>
      {image}
      {thumbs}
    </div>
  )
}

export function FrameImage({
  src,
  alt,
  emptyLabel,
  onError,
}: {
  src: string | null
  alt: string
  emptyLabel: string
  onError?: () => void
}) {
  if (!src) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-well px-4 text-center text-muted">
        {emptyLabel}
      </div>
    )
  }
  return (
    <div className="aspect-[16/10] overflow-hidden bg-well">
      <img src={src} alt={alt} className="h-full w-full object-cover" onError={onError} />
    </div>
  )
}
