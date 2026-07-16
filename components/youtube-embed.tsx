'use client'

import { cn } from '@/lib/utils'

type YoutubeEmbedProps = {
  videoId: string
  title: string
  className?: string
}

export function YoutubeEmbed({ videoId, title, className }: YoutubeEmbedProps) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden bg-muted/40', className)}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  )
}
