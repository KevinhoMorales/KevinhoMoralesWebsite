'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, ExternalLink, Video } from 'lucide-react'
import type { Conference } from '@/types'

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {conferences.map((conf) => (
              <Card
                key={conf.id}
                className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base">{conf.title}</h3>
                  {conf.topic && (
                    <p className="text-xs sm:text-sm text-primary font-medium mt-1 line-clamp-2">
                      {conf.topic}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                    {conf.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {conf.location}
                      </span>
                    )}
                    {conf.videoUrl && (
                      <a
                        href={conf.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
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
                        className="flex items-center gap-1 text-primary hover:underline"
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
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
