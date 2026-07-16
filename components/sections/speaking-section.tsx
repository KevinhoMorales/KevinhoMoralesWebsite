'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { handleHomeHashLinkClick } from '@/lib/section-scroll'
import { FilterChipRow } from '@/components/ui/filter-chip-row'
import { cn } from '@/lib/utils'
import { ArrowRight, Calendar, ExternalLink, Mic } from 'lucide-react'
import type { Profile } from '@/types'

type SpeakingSectionProps = {
  profile: Profile
}

export function SpeakingSection({ profile }: SpeakingSectionProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const sessionizeUrl = profile.socialLinks?.sessionize
  const calendlyUrl = profile.socialLinks?.calendly

  const topics = [
    t('speakingSection.topicMobile'),
    t('speakingSection.topicFintech'),
    t('speakingSection.topicAi'),
    t('speakingSection.topicCommunity'),
  ]

  return (
    <section
      id="speaking"
      data-analytics-section="speaking"
      className="py-3 sm:py-4 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-3 sm:mb-4">
          <p className="text-primary font-medium tracking-wide uppercase text-[10px] sm:text-xs mb-1 flex items-center gap-1.5">
            <Mic className="h-3.5 w-3.5" aria-hidden />
            {t('speakingSection.kicker')}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-balance leading-tight">
            {t('speakingSection.title')}
          </h2>
          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-snug">
            {t('speakingSection.description')}
          </p>
        </ScrollReveal>

        <Card className="overflow-hidden border-border/50 bg-card/50 py-0 shadow-sm">
          <CardContent className="grid gap-4 p-4 sm:gap-5 sm:p-5 md:grid-cols-[minmax(0,11.5rem)_minmax(0,1fr)] md:items-start md:gap-6">
            <ScrollReveal variant="fade-right" delay={0}>
              <div className="flex flex-col gap-3">
                <div className="relative mx-auto h-[4.25rem] w-[7rem] md:mx-0 md:h-[4.5rem] md:w-[7.5rem]">
                  <Image
                    src="/images/sessionize-most-active-speaker-2024.png"
                    alt="Sessionize Most Active Speaker 2024"
                    fill
                    sizes="120px"
                    className="object-contain object-center md:object-left"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {sessionizeUrl ? (
                    <Button size="sm" asChild className="h-9 w-full justify-center gap-1.5 text-xs">
                      <a href={sessionizeUrl} target="_blank" rel="noopener noreferrer">
                        {t('speakingSection.sessionizeCta')}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      </a>
                    </Button>
                  ) : null}
                  {calendlyUrl ? (
                    <Button size="sm" variant="outline" asChild className="h-9 w-full justify-center gap-1.5 text-xs">
                      <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
                        <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {t('speakingSection.calendlyCta')}
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-left" delay={0.12}>
              <div className="min-w-0 md:border-l md:border-border/40 md:pl-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('speakingSection.topicsLabel')}
                </p>
                <FilterChipRow className="sm:flex-wrap">
                  {topics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className={cn(
                        'shrink-0 rounded-full border-border/60 bg-background/50 px-2 py-0.5 text-[10px] font-normal leading-snug sm:px-2.5 sm:py-1 sm:text-xs',
                        'transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                      )}
                    >
                      {topic}
                    </Badge>
                  ))}
                </FilterChipRow>
                <Link
                  href="/#conferences"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  onClick={(e) => handleHomeHashLinkClick(e, pathname, '/#conferences')}
                >
                  {t('speakingSection.viewConferences')}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </Link>
              </div>
            </ScrollReveal>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
