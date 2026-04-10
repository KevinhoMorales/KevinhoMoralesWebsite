'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ConferenceImagesCarousel } from '@/components/conference-images-carousel'
import { Calendar, ExternalLink, MapPin, Users, Video } from 'lucide-react'
import { useI18n } from '@/components/i18n/locale-provider'
import { CONFERENCE_BADGE_OVERLAY_CLASS } from '@/lib/conference-ui'
import { hasWatchableVideoUrl } from '@/lib/conference-video-url'
import { formatConferenceVenueLine } from '@/lib/conference-location-platform'
import { getConferenceTagClassName } from '@/lib/conference-tag-styles'
import { cn } from '@/lib/utils'
import type { Conference } from '@/types'

type ConferenceDetailModalProps = {
  conference: Conference | null
  open: boolean
  onClose: () => void
}

export function ConferenceDetailModal({ conference, open, onClose }: ConferenceDetailModalProps) {
  const { t } = useI18n()

  const confType = (type: string) => {
    const k = `conferenceType.${type}`
    const s = t(k)
    return s === k ? type : s
  }

  const c = conference
  if (!c) return null

  const imgs = c.images ?? []
  const hasImages = imgs.length > 0
  const venueLine = formatConferenceVenueLine(c, t)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[min(90dvh,880px)] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="max-h-[min(90dvh,880px)] overflow-y-auto">
          {hasImages ? (
            <ConferenceImagesCarousel images={imgs} alt={c.title} className="sm:rounded-t-2xl">
              <Badge className={cn(CONFERENCE_BADGE_OVERLAY_CLASS)}>{confType(c.type)}</Badge>
              {c.country && <Badge className={cn(CONFERENCE_BADGE_OVERLAY_CLASS)}>{c.country}</Badge>}
            </ConferenceImagesCarousel>
          ) : null}

          <div className="space-y-4 p-5 sm:p-6">
            {!hasImages && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{confType(c.type)}</Badge>
                {c.country && <Badge variant="outline">{c.country}</Badge>}
              </div>
            )}

            <DialogHeader className="text-left">
              <DialogTitle className="text-xl sm:text-2xl pr-8">{c.title}</DialogTitle>
              <DialogDescription className="sr-only">
                {[confType(c.type), c.topic, venueLine, c.date?.trim()]
                  .filter(Boolean)
                  .join('. ')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {c.topic ? <p className="text-base font-medium text-primary">{c.topic}</p> : null}

              <dl className="grid gap-2 text-sm text-muted-foreground">
                {c.date?.trim() ? (
                  <div className="flex gap-2">
                    <dt className="flex shrink-0 items-center gap-1.5 font-medium text-foreground/80">
                      <Calendar className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                      {t('conferences.detailDate')}
                    </dt>
                    <dd>{c.date.trim()}</dd>
                  </div>
                ) : null}
                {venueLine ? (
                  <div className="flex gap-2">
                    <dt className="flex shrink-0 items-center gap-1.5 font-medium text-foreground/80">
                      <MapPin className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                      {t('conferences.detailLocation')}
                    </dt>
                    <dd>{venueLine}</dd>
                  </div>
                ) : null}
                {c.audience != null ? (
                  <div className="flex gap-2">
                    <dt className="flex shrink-0 items-center gap-1.5 font-medium text-foreground/80">
                      <Users className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                      {t('conferences.detailAudience')}
                    </dt>
                    <dd>{t('conferences.attendees', { count: String(c.audience) })}</dd>
                  </div>
                ) : null}
              </dl>

              {(hasWatchableVideoUrl(c.videoUrl) || c.eventUrl?.trim()) && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {hasWatchableVideoUrl(c.videoUrl) ? (
                    <a
                      href={c.videoUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <Video className="h-4 w-4 shrink-0" />
                      {t('conferences.watchVideo')}
                    </a>
                  ) : null}
                  {c.eventUrl?.trim() ? (
                    <a
                      href={c.eventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      {t('conferences.event')}
                    </a>
                  ) : null}
                </div>
              )}

              {c.tags && c.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${getConferenceTagClassName(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
