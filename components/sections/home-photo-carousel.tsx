'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import { cn } from '@/lib/utils'

export type HomePhotoSlide = {
  src: string
  alt: string
  caption?: string
}

type PhotoAspect = 'square' | 'video' | 'wide'

interface HomePhotoCarouselProps {
  slides: HomePhotoSlide[]
  variant?: 'fade-left' | 'fade-right' | 'fade-up'
  aspect?: PhotoAspect
  className?: string
  standalone?: boolean
  /** Auto-advance interval in ms; 0 disables */
  autoPlayMs?: number
}

const aspectClasses: Record<PhotoAspect, string> = {
  square: 'aspect-square max-h-[min(70vh,520px)]',
  video: 'aspect-video',
  wide: 'aspect-[1024/651]',
}

export function HomePhotoCarousel({
  slides,
  variant = 'fade-up',
  aspect = 'square',
  className,
  standalone = false,
  autoPlayMs = 0,
}: HomePhotoCarouselProps) {
  const [index, setIndex] = useState(0)
  const count = slides.length

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return
      setIndex(((next % count) + count) % count)
    },
    [count]
  )

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index])
  const goNext = useCallback(() => goTo(index + 1), [goTo, index])

  useEffect(() => {
    setIndex(0)
  }, [slides.map((s) => s.src).join('\0')])

  useEffect(() => {
    if (autoPlayMs <= 0 || count <= 1) return
    const id = window.setInterval(() => goNext(), autoPlayMs)
    return () => window.clearInterval(id)
  }, [autoPlayMs, count, goNext])

  if (count === 0) return null

  const current = slides[Math.min(index, count - 1)]
  const showControls = count > 1

  const content = (
    <ScrollReveal variant={variant} className={className}>
      <Card className="overflow-hidden border-border/50 bg-card/50 shadow-sm">
        <CardContent className="p-0">
          <div
            className={cn('group/carousel relative w-full overflow-hidden', aspectClasses[aspect])}
            role="region"
            aria-roledescription="carousel"
            aria-label={current.alt}
          >
            {slides.map((slide, i) => (
              <div
                key={slide.src}
                className={cn(
                  'absolute inset-0 transition-opacity duration-500',
                  i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${count}`}
                aria-hidden={i !== index}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 1152px"
                  priority={i === 0}
                />
              </div>
            ))}

            {showControls ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-90 shadow-lg backdrop-blur-sm transition-opacity hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-0 sm:group-hover/carousel:opacity-100 sm:left-3 sm:h-10 sm:w-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-90 shadow-lg backdrop-blur-sm transition-opacity hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-0 sm:group-hover/carousel:opacity-100 sm:right-3 sm:h-10 sm:w-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>

                <div className="pointer-events-none absolute inset-x-0 bottom-14 z-10 flex justify-center px-2 sm:bottom-16">
                  <div
                    className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5 shadow-lg backdrop-blur-sm"
                    role="tablist"
                    aria-label="Photo slides"
                  >
                    {slides.map((slide, i) => (
                      <button
                        key={slide.src}
                        type="button"
                        role="tab"
                        aria-selected={i === index}
                        aria-label={`${i + 1} / ${count}`}
                        className={cn(
                          'h-2 w-2 shrink-0 rounded-full transition-[transform,background-color] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50',
                          i === index
                            ? 'scale-125 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]'
                            : 'bg-white/45 hover:bg-white/80'
                        )}
                        onClick={() => goTo(i)}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>

          {current.caption ? (
            <p className="px-4 py-3 text-sm text-muted-foreground sm:px-5 sm:py-4 sm:text-base">
              {current.caption}
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
      aria-label="Personal photos"
      className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-4 sm:py-5 md:py-6"
    >
      <div className="max-w-6xl mx-auto">{content}</div>
    </section>
  )
}
