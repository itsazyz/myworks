'use client'

import { useState } from 'react'
import { BrowserFrame, FrameImage } from '@/components/browser-frame'

export function ShotGallery({
  shots,
  address,
  emptyLabel,
  imageAlt,
  thumbLabels,
}: {
  shots: string[]
  address: string
  emptyLabel: string
  imageAlt: string
  thumbLabels: string[]
}) {
  const [active, setActive] = useState(0)
  const [broken, setBroken] = useState<string | null>(null)
  const current = shots[active] ?? null
  const src = current && broken !== current ? current : null

  return (
    <BrowserFrame
      address={address}
      image={<FrameImage src={src} alt={imageAlt} emptyLabel={emptyLabel} onError={current ? () => setBroken(current) : undefined} />}
      thumbs={
        <ul className="flex flex-wrap gap-2 border-t border-ink p-3">
          {shots.map((shot, index) => (
            <li key={`${shot}-${index}`}>
              <button
                type="button"
                aria-pressed={index === active}
                aria-label={thumbLabels[index] ?? imageAlt}
                className={`h-16 w-24 overflow-hidden border-2 bg-well p-0 ${index === active ? 'border-ink' : 'border-muted'}`}
                onClick={() => setActive(index)}
              >
                <img src={shot} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      }
    />
  )
}
