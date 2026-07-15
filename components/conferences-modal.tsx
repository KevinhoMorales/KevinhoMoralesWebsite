'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ConferenceImagesCarousel } from '@/components/conference-images-carousel'
import { ConferenceDetailModal } from '@/components/conference-detail-modal'
import { BrowseListModal } from '@/components/ui/browse-list-modal'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users } from 'lucide-react'
import { useI18n } from '@/components/i18n/locale-provider'
import { CONFERENCE_BADGE_OVERLAY_CLASS } from '@/lib/conference-ui'
import { formatConferenceVenueLine } from '@/lib/conference-location-platform'
import { getConferenceTagClassName } from '@/lib/conference-tag-styles'
import { normalizeForSearch } from '@/lib/normalize-for-search'
import { cn } from '@/lib/utils'
import type { Conference } from '@/types'

interface ConferencesModalProps {
  conferences: Conference[]
  open: boolean
  onClose: () => void
}

export function ConferencesModal({ conferences, open, onClose }: ConferencesModalProps) {
  const { t } = useI18n()
  const [detailConference, setDetailConference] = useState<Conference | null>(null)
  const [search, setSearch] = useState('')

  const confType = (type: string) => {
    const k = `conferenceType.${type}`
    const s = t(k)
    return s === k ? type : s
  }

  useEffect(() => {
    if (!open) {
      setDetailConference(null)
      setSearch('')
    }
  }, [open])

  const filteredConferences = useMemo(() => {
    const q = normalizeForSearch(search.trim())
    if (!q) return conferences

    return conferences.filter((conf) => {
      const venueLine = formatConferenceVenueLine(conf, t) ?? ''
      const haystack = normalizeForSearch(
        [conf.title, conf.topic ?? '', conf.country ?? '', venueLine, ...(conf.tags ?? [])].join(' ')
      )
      return haystack.includes(q)
    })
  }, [conferences, search, t])

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose()
  }

  return (
    <>
      <BrowseListModal
        open={open}
        onOpenChange={handleOpenChange}
        title={t('conferencesModal.title')}
        searchPlaceholder={t('conferencesModal.searchPlaceholder')}
        searchValue={search}
        onSearchChange={setSearch}
        emptyMessage={t('browseModal.noResults')}
        isEmpty={filteredConferences.length === 0}
      >
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5">
          {filteredConferences.map((conf) => {
            const imgs = conf.images ?? []
            const hasImages = imgs.length > 0
            const venueLine = formatConferenceVenueLine(conf, t)

            return (
              <Card
                key={conf.id}
                className="flex h-full flex-col bg-card/50 border-border/50 gap-0 overflow-hidden py-0 hover:border-primary/50 transition-colors"
              >
                <div
                  role="button"
                  tabIndex={0}
                  className="flex min-h-0 flex-1 cursor-pointer flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`${t('conferences.openDetail')}: ${conf.title}`}
                  onClick={() => setDetailConference(conf)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setDetailConference(conf)
                    }
                  }}
                >
                  {hasImages && (
                    <ConferenceImagesCarousel images={imgs} alt={conf.title} compact>
                      <Badge className={cn(CONFERENCE_BADGE_OVERLAY_CLASS, 'text-xs')}>
                        {confType(conf.type)}
                      </Badge>
                      {conf.country && (
                        <Badge className={cn(CONFERENCE_BADGE_OVERLAY_CLASS, 'text-xs')}>
                          {conf.country}
                        </Badge>
                      )}
                    </ConferenceImagesCarousel>
                  )}
                  <CardContent className="flex flex-1 flex-col p-3 sm:p-4">
                    {!hasImages && (
                      <div className="mb-2 flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {confType(conf.type)}
                        </Badge>
                        {conf.country && (
                          <Badge variant="outline" className="text-xs">
                            {conf.country}
                          </Badge>
                        )}
                      </div>
                    )}
                    <h3 className="line-clamp-2 font-semibold text-sm sm:text-base">{conf.title}</h3>
                    {conf.topic && (
                      <p className="mt-1 line-clamp-2 text-xs font-medium text-primary sm:text-sm">
                        {conf.topic}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {venueLine && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {venueLine}
                        </span>
                      )}
                      {conf.audience != null && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 shrink-0" />
                          {t('conferences.attendees', { count: String(conf.audience) })}
                        </span>
                      )}
                    </div>
                    {conf.tags && conf.tags.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-1 pt-2">
                        {conf.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getConferenceTagClassName(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      </BrowseListModal>

      <ConferenceDetailModal
        conference={detailConference}
        open={detailConference !== null}
        onClose={() => setDetailConference(null)}
      />
    </>
  )
}
