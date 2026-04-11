'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ConferenceImagesCarousel } from '@/components/conference-images-carousel'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowRight, Users } from 'lucide-react'
import { ConferencesModal } from '@/components/conferences-modal'
import { ConferenceDetailModal } from '@/components/conference-detail-modal'
import { useI18n } from '@/components/i18n/locale-provider'
import { CONFERENCE_BADGE_OVERLAY_CLASS } from '@/lib/conference-ui'
import { formatConferenceVenueLine } from '@/lib/conference-location-platform'
import { getConferenceTagClassName } from '@/lib/conference-tag-styles'
import { cn } from '@/lib/utils'
import type { Conference } from '@/types'

interface ConferencesProps {
  conferences: Conference[]
}

/** Charlas más recientes en la home; el resto se abre en el modal "Ver más". */
const PREVIEW_COUNT = 6

function ConferenceCard({ conf, onOpenDetail }: { conf: Conference; onOpenDetail: () => void }) {
  const { t } = useI18n()
  const confType = (type: string) => {
    const k = `conferenceType.${type}`
    const s = t(k)
    return s === k ? type : s
  }
  const images = conf.images ?? []
  const hasImages = images.length > 0
  const venueLine = formatConferenceVenueLine(conf, t)

  return (
    <Card className="flex h-full flex-col bg-card/50 border-border/50 gap-0 overflow-hidden py-0 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <div
        role="button"
        tabIndex={0}
        className="flex min-h-0 flex-1 cursor-pointer flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`${t('conferences.openDetail')}: ${conf.title}`}
        onClick={onOpenDetail}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpenDetail()
          }
        }}
      >
        {hasImages && (
          <ConferenceImagesCarousel images={images} alt={conf.title}>
            <Badge className={cn(CONFERENCE_BADGE_OVERLAY_CLASS)}>{confType(conf.type)}</Badge>
            {conf.country && (
              <Badge className={cn(CONFERENCE_BADGE_OVERLAY_CLASS)}>{conf.country}</Badge>
            )}
          </ConferenceImagesCarousel>
        )}
        <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            {!hasImages && (
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{confType(conf.type)}</Badge>
                {conf.country && <Badge variant="outline">{conf.country}</Badge>}
              </div>
            )}
            <div>
              <h3 className="line-clamp-2 font-semibold text-base leading-tight sm:text-lg">{conf.title}</h3>
              {conf.topic && (
                <p className="mt-1 line-clamp-2 text-sm font-medium text-primary">{conf.topic}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {venueLine && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {venueLine}
                </span>
              )}
              {conf.audience != null && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  {t('conferences.attendees', { count: String(conf.audience) })}
                </span>
              )}
            </div>
            {conf.tags && conf.tags.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                {conf.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex text-[11px] px-2 py-0.5 rounded-full font-medium ${getConferenceTagClassName(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function ConferencesSection({ conferences }: ConferencesProps) {
  const { t } = useI18n()
  const [modalOpen, setModalOpen] = useState(false)
  const [detailConference, setDetailConference] = useState<Conference | null>(null)

  const previewConferences = conferences.slice(0, PREVIEW_COUNT)
  const remainingConferences = conferences.slice(PREVIEW_COUNT)
  const hasMore = remainingConferences.length > 0

  if (conferences.length === 0) {
    return (
      <section
        id="conferences"
        data-analytics-section="conferences"
        className="scroll-mt-20 py-10 sm:py-12 md:py-14 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30"
      >
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">
            {t('conferences.kicker')}
          </p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-balance">{t('conferences.title')}</h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-muted-foreground">
            {t('pages.conferences.empty')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="conferences"
      data-analytics-section="conferences"
      className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30"
    >
      <div className="max-w-6xl mx-auto">
        <div>
          <ScrollReveal className="mb-6 sm:mb-8">
            <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">
              {t('conferences.kicker')}
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-balance">{t('conferences.title')}</h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('conferences.description')}
            </p>
            <p className="mt-2 text-sm font-medium text-primary">
              {t('conferences.totalCount', { count: String(conferences.length) })}
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {previewConferences.map((conf, index) => (
              <StaggerItem key={conf.id} delay={index * 0.06} className="h-full">
                <ConferenceCard conf={conf} onOpenDetail={() => setDetailConference(conf)} />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {hasMore ? (
            <ScrollReveal delay={0.12} className="mt-8 sm:mt-10 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="gap-2 rounded-xl"
                onClick={() => setModalOpen(true)}
              >
                {t('conferences.seeMore')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </ScrollReveal>
          ) : null}
        </div>
      </div>

      <ConferencesModal
        conferences={remainingConferences}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <ConferenceDetailModal
        conference={detailConference}
        open={detailConference !== null}
        onClose={() => setDetailConference(null)}
      />
    </section>
  )
}
