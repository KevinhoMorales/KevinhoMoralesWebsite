'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import { YoutubeEmbed } from '@/components/youtube-embed'
import { useI18n } from '@/components/i18n/locale-provider'
import { cn } from '@/lib/utils'

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
    <ScrollReveal variant={variant} className={cn('min-w-0', className)}>
      <Card className="gap-0 overflow-hidden border-border/50 bg-card/50 py-0 shadow-sm">
        <CardContent className="flex flex-col p-0">
          <YoutubeEmbed
            videoId={FEATURED_VIDEO_ID}
            title={t('podcastUi.featuredVideoTitle')}
          />
          <p className="shrink-0 px-4 py-3 text-sm text-muted-foreground sm:px-5 sm:py-4 sm:text-base">
            {t('homePhotos.podcast.caption')}
          </p>
        </CardContent>
      </Card>
    </ScrollReveal>
  )
}
