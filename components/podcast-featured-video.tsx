'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import { YoutubeEmbed } from '@/components/youtube-embed'
import { useI18n } from '@/components/i18n/locale-provider'
import { cn } from '@/lib/utils'
import { Mic2 } from 'lucide-react'

const FEATURED_VIDEO_ID = 'iN0KhSTvxKI'

type PodcastFeaturedVideoProps = {
  className?: string
  variant?: 'fade-left' | 'fade-right' | 'fade-up'
}

export function PodcastFeaturedVideo({
  className,
  variant = 'fade-right',
}: PodcastFeaturedVideoProps) {
  const { t } = useI18n()

  return (
    <ScrollReveal variant={variant} className={cn('flex min-w-0 flex-col gap-4', className)}>
      <Card className="gap-0 overflow-hidden border-border/50 bg-card/50 py-0 shadow-sm">
        <CardContent className="flex flex-col p-0">
          <YoutubeEmbed
            videoId={FEATURED_VIDEO_ID}
            title={t('podcastUi.featuredVideoTitle')}
          />
          <p className="shrink-0 border-b border-border/40 px-4 py-3 text-sm text-muted-foreground sm:px-5 sm:py-3.5 sm:text-[15px]">
            {t('homePhotos.podcast.caption')}
          </p>
        </CardContent>
      </Card>

      <Card className="gap-0 border-border/50 bg-card/50 py-0 shadow-sm">
        <CardContent className="space-y-3 p-4 sm:space-y-3.5 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <Mic2 className="h-4 w-4" aria-hidden />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary sm:text-[13px]">
              {t('podcastUi.storyKicker')}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {t('podcastUi.storyP1')}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {t('podcastUi.storyP2')}
          </p>
          <p className="text-sm leading-relaxed text-foreground/85 sm:text-[15px]">
            {t('podcastUi.storyP3')}
          </p>
        </CardContent>
      </Card>
    </ScrollReveal>
  )
}
