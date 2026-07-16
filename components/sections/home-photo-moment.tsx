'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import { cn } from '@/lib/utils'

type PhotoVariant = 'fade-left' | 'fade-right' | 'fade-up'
type PhotoAspect = 'square' | 'video' | 'wide'

interface HomePhotoMomentProps {
  src: string
  alt: string
  caption?: string
  variant?: PhotoVariant
  aspect?: PhotoAspect
  className?: string
  /** Stretch image to fill a tall grid column (e.g. podcast sidebar) */
  fillColumn?: boolean
  /** Wrap in section padding when used standalone between homepage sections */
  standalone?: boolean
}

const aspectClasses: Record<PhotoAspect, string> = {
  square: 'aspect-square max-h-[min(70vh,520px)]',
  video: 'aspect-video',
  wide: 'aspect-[1024/651]',
}

export function HomePhotoMoment({
  src,
  alt,
  caption,
  variant = 'fade-up',
  aspect = 'video',
  className,
  fillColumn = false,
  standalone = false,
}: HomePhotoMomentProps) {
  const content = (
    <ScrollReveal
      variant={variant}
      className={cn(fillColumn && 'h-full min-h-0', className)}
    >
      <Card className="h-full gap-0 overflow-hidden border-border/50 bg-card/50 py-0 shadow-sm transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <CardContent className="flex h-full min-h-0 flex-col p-0">
          <div
            className={cn(
              'relative w-full overflow-hidden',
              fillColumn
                ? cn(
                    aspectClasses[aspect],
                    'lg:aspect-auto lg:min-h-[220px] lg:flex-1',
                    'transition-[height,min-height,flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
                  )
                : aspectClasses[aspect]
            )}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 1152px"
            />
          </div>
          {caption ? (
            <p className="shrink-0 px-4 py-3 text-sm text-muted-foreground sm:px-5 sm:py-4 sm:text-base">
              {caption}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </ScrollReveal>
  )

  if (!standalone) {
    return content
  }

  return (
    <section
      aria-label={alt}
      className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-4 sm:py-5 md:py-6"
    >
      <div className="max-w-6xl mx-auto">{content}</div>
    </section>
  )
}
