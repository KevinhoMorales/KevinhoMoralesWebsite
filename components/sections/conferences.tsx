'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ConferenceImagesCarousel } from '@/components/conference-images-carousel'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { Button } from '@/components/ui/button'
import { MapPin, ChevronRight, Users } from 'lucide-react'
import { ConferencesModal } from '@/components/conferences-modal'
import { ConferenceDetailModal } from '@/components/conference-detail-modal'
import { useI18n } from '@/components/i18n/locale-provider'
import { CONFERENCE_BADGE_OVERLAY_CLASS } from '@/lib/conference-ui'
import { cn } from '@/lib/utils'
import type { Conference } from '@/types'

interface ConferencesProps {
  conferences: Conference[]
}

const PREVIEW_COUNT = 3

const TAG_COLORS: Record<string, string> = {
  Android: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  iOS: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  Flutter: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
  Kotlin: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
  ML: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  AI: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
  default: 'bg-primary/15 text-primary',
}

function getTagClassName(tag: string): string {
  return TAG_COLORS[tag] ?? TAG_COLORS.default
}

function ConferenceCard({ conf, onOpenDetail }: { conf: Conference; onOpenDetail: () => void }) {
  const { t } = useI18n()
  const confType = (type: string) => {
    const k = `conferenceType.${type}`
    const s = t(k)
    return s === k ? type : s
  }
  const images = conf.images ?? []
  const hasImages = images.length > 0

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
          <ConferenceImagesCarousel
            images={images}
            alt={conf.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          >
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
              {conf.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {conf.location}
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
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${getTagClassName(tag)}`}
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

  if (conferences.length === 0) {
    return null
  }

  return (
    <section id="conferences" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div>
          <ScrollReveal className="mb-4 sm:mb-6">
            <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">
              {t('conferences.kicker')}
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-balance">{t('conferences.title')}</h2>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {conferences.slice(0, PREVIEW_COUNT).map((conf, index) => (
              <StaggerItem key={conf.id} delay={index * 0.06} className="h-full">
                <ConferenceCard conf={conf} onOpenDetail={() => setDetailConference(conf)} />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {conferences.length > PREVIEW_COUNT ? (
            <ScrollReveal delay={0.15} className="mt-6">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setModalOpen(true)}
              >
                {t('conferences.seeMore', { count: String(conferences.length) })}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </ScrollReveal>
          ) : null}
        </div>
      </div>

      <ConferencesModal conferences={conferences} open={modalOpen} onClose={() => setModalOpen(false)} />

      <ConferenceDetailModal
        conference={detailConference}
        open={detailConference !== null}
        onClose={() => setDetailConference(null)}
      />
    </section>
  )
}
