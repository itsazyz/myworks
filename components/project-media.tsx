import { BrowserFrame, FrameImage } from '@/components/browser-frame'
import { ShotGallery } from '@/components/shot-gallery'
import { isHttpUrl } from '@/lib/http'

export function ProjectMedia({
  shots,
  name,
  emptyLabel,
  address,
  thumbLabels,
}: {
  shots: string[]
  name: string
  emptyLabel: string
  address: string
  thumbLabels: string[]
}) {
  const safeShots = shots.filter(isHttpUrl)
  if (safeShots.length > 1) {
    return (
      <ShotGallery
        shots={safeShots}
        address={address}
        emptyLabel={emptyLabel}
        imageAlt={name}
        thumbLabels={thumbLabels}
      />
    )
  }
  return <BrowserFrame address={address} image={<FrameImage src={safeShots[0] ?? null} alt={name} emptyLabel={emptyLabel} />} />
}
