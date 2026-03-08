'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, ExternalLink, Video, Users } from 'lucide-react'
import type { Conference } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  conference: 'Conference',
  virtual: 'Virtual',
  talk: 'Talk',
  meetup: 'Meetup',
}

const TAG_COLORS: Record<string, string> = {
  Android: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  iOS: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  Flutter: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
  Kotlin: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
  default: 'bg-primary/15 text-primary',
}

function getTagClassName(tag: string): string {
  return TAG_COLORS[tag] ?? TAG_COLORS.default
}

interface ConferencesModalProps {
  conferences: Conference[]
  open: boolean
  onClose: () => void
}

export function ConferencesModal({ conferences, open, onClose }: ConferencesModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="conferences-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-lg overflow-hidden bg-background shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border shrink-0">
          <h2 id="conferences-modal-title" className="text-lg sm:text-xl font-bold">
            Todas las conferencias
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-secondary transition-colors"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {conferences.map((conf) => {
              const mainImage = conf.images?.[0]
              return (
                <Card
                  key={conf.id}
                  className="bg-card/50 border-border/50 overflow-hidden hover:border-primary/50 transition-colors"
                >
                  {mainImage && (
                    <div className="relative aspect-video overflow-hidden bg-secondary">
                      <Image
                        src={mainImage}
                        alt={conf.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <Badge
                          variant="secondary"
                          className="bg-background/90 text-xs [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]"
                        >
                          {TYPE_LABELS[conf.type] ?? conf.type}
                        </Badge>
                        {conf.country && (
                          <Badge
                            variant="secondary"
                            className="bg-background/90 text-xs [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]"
                          >
                            {conf.country}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <CardContent className="p-3 sm:p-4">
                    {!mainImage && (
                      <div className="flex gap-2 flex-wrap mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {TYPE_LABELS[conf.type] ?? conf.type}
                        </Badge>
                        {conf.country && (
                          <Badge variant="outline" className="text-xs">
                            {conf.country}
                          </Badge>
                        )}
                      </div>
                    )}
                    <h3 className="font-semibold text-sm sm:text-base">{conf.title}</h3>
                    {conf.topic && (
                      <p className="text-xs sm:text-sm text-primary font-medium mt-1 line-clamp-2">
                        {conf.topic}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {conf.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {conf.location}
                        </span>
                      )}
                      {conf.audience != null && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {conf.audience} asistentes
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {conf.videoUrl && (
                        <a
                          href={conf.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Video className="h-3 w-3" />
                          Ver video
                        </a>
                      )}
                      {conf.eventUrl && !conf.videoUrl && (
                        <a
                          href={conf.eventUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Evento
                        </a>
                      )}
                    </div>
                    {conf.tags && conf.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {conf.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${getTagClassName(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
