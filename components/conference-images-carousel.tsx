'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type ConferenceImagesCarouselProps = {
  images: string[]
  alt: string
  sizes: string
  /** Badges u overlay en esquina superior izquierda */
  children?: ReactNode
  className?: string
  /** Imagen más baja (p. ej. modal en grid) — sin `sm:aspect-[16/9]` */
  compact?: boolean
}

export function ConferenceImagesCarousel({
  images,
  alt,
  sizes,
  children,
  className,
  compact = false,
}: ConferenceImagesCarouselProps) {
  const list = images.filter(Boolean)
  const [index, setIndex] = useState(0)
  if (list.length === 0) return null

  const current = list[Math.min(index, list.length - 1)]
  const showDots = list.length > 1

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-secondary',
        compact ? 'aspect-video' : 'aspect-video sm:aspect-[16/9]',
        className
      )}
    >
      <Image
        key={current}
        src={current}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 hover:scale-105"
        sizes={sizes}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
      {children != null ? (
        <div className="absolute top-3 left-3 flex gap-2 z-10">{children}</div>
      ) : null}
      {showDots ? (
        <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center px-2 pointer-events-none">
          <div
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5 shadow-lg backdrop-blur-sm supports-[backdrop-filter]:bg-black/35"
            role="tablist"
            aria-label={`${alt} — ${list.length} images`}
          >
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${i + 1} / ${list.length}`}
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full transition-[transform,background-color,box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50',
                  i === index
                    ? 'scale-125 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]'
                    : 'bg-white/45 hover:bg-white/80'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setIndex(i)
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
