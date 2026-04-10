'use client'

import { Presentation } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { storageObjectPathToPublicUrl } from '@/lib/storage-public-url'
import { cn } from '@/lib/utils'

/** No reprocesar URLs https ya resueltas en el servidor (firmas, tokens); solo expandir rutas relativas. */
function imageSrcForCarousel(ref: string): string {
  const s = typeof ref === 'string' ? ref.trim() : ''
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  return storageObjectPathToPublicUrl(s)
}

type ConferenceImagesCarouselProps = {
  images: string[]
  alt: string
  /** Badges u overlay en esquina superior izquierda */
  children?: ReactNode
  className?: string
  /** Imagen más baja (p. ej. modal en grid) — sin `sm:aspect-[16/9]` */
  compact?: boolean
}

/**
 * Misma estrategia que el panel admin (`<img src={storageObjectPathToPublicUrl(...)} />`):
 * `<img>` directo evita el pipeline de `next/image`, que suele fallar con URLs largas firmadas de GCS.
 */
export function ConferenceImagesCarousel({
  images,
  alt,
  children,
  className,
  compact = false,
}: ConferenceImagesCarouselProps) {
  const list = useMemo(
    () => images.map((r) => imageSrcForCarousel(r)).filter((u) => u.length > 0),
    [images]
  )
  const listKey = useMemo(() => list.join('\0'), [list])
  const [index, setIndex] = useState(0)
  const [failedUrls, setFailedUrls] = useState<Record<string, true>>({})

  useEffect(() => {
    setFailedUrls({})
  }, [listKey])

  if (list.length === 0) return null

  const current = list[Math.min(index, list.length - 1)]
  const showDots = list.length > 1
  const showPlaceholder = Boolean(failedUrls[current])

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-secondary',
        compact ? 'aspect-video' : 'aspect-video sm:aspect-[16/9]',
        className
      )}
    >
      {showPlaceholder ? (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-secondary to-secondary"
        >
          <Presentation className="h-12 w-12 shrink-0 text-muted-foreground/45 sm:h-14 sm:w-14" aria-hidden />
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- paridad con admin; URLs de Storage/GCS */
        <img
          key={current}
          src={current}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={() => {
            setFailedUrls((prev) => ({ ...prev, [current]: true }))
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      {children != null ? (
        <div className="absolute left-3 top-3 z-10 flex gap-2">{children}</div>
      ) : null}
      {showDots ? (
        <div className="pointer-events-none absolute bottom-2 left-0 right-0 z-10 flex justify-center px-2">
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
