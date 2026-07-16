'use client'

import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/scroll-reveal'
import { PodcastFeaturedVideo } from '@/components/podcast-featured-video'
import { useI18n } from '@/components/i18n/locale-provider'
import { ExternalLink, Headphones } from 'lucide-react'
import { PodcastSection } from '@/components/podcast-section'
import { SECTION_PADDING } from '@/lib/section-layout'

export function PodcastSectionUI() {
  const { t } = useI18n()
  return (
    <section
      id="podcast"
      data-analytics-section="podcast"
      className={SECTION_PADDING}
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">{t('podcastUi.kicker')}</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
              {t('podcastUi.title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4 max-w-xl">
              {t('podcastUi.subtitle')}
            </p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0" asChild>
            <a
              href="https://www.youtube.com/@DevLokos/podcasts"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Headphones className="h-4 w-4" />
              {t('podcastUi.listenYoutube')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-10">
          <PodcastFeaturedVideo className="lg:sticky lg:top-20 lg:self-start" />

          <ScrollReveal variant="fade-left" delay={0.15} className="flex min-h-0 min-w-0 flex-1 flex-col">
            <PodcastSection />
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
