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
import { cn } from '@/lib/utils'
import { ArrowRight, Calendar, ExternalLink, Mic } from 'lucide-react'
import type { Profile } from '@/types'

const DEFAULT_SPEAKING_IMAGE = '/images/kevin-cursor-talk.jpg'

type SpeakingSectionProps = {
  profile: Profile
}

export function SpeakingSection({ profile }: SpeakingSectionProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const sessionizeUrl = profile.socialLinks?.sessionize
  const calendlyUrl = profile.socialLinks?.calendly
  const speakingImage = profile.speakingImage ?? DEFAULT_SPEAKING_IMAGE

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
          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
            {t('speakingSection.description')}
          </p>
        </ScrollReveal>

        <Card className="overflow-x-clip border-border/50 bg-card/50 py-0 shadow-sm">
          <CardContent className="grid min-w-0 gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_minmax(0,11rem)] lg:items-start lg:gap-8">
            <ScrollReveal variant="fade-right" delay={0} className="min-w-0 lg:col-start-1 lg:row-start-1">
              <div className="flex w-full min-w-0 flex-col gap-3">
                <div className="relative mx-auto h-[4.25rem] w-[7rem] shrink-0 sm:mx-0 sm:h-[4.5rem] sm:w-[7.5rem]">
                  <Image
                    src="/images/sessionize-most-active-speaker-2024.png"
                    alt="Sessionize Most Active Speaker 2024"
                    fill
                    sizes="120px"
                    className="object-contain object-center sm:object-left"
                  />
                </div>
                <div className="flex w-full min-w-0 flex-col gap-2">
                  {sessionizeUrl ? (
                    <Button
                      size="sm"
                      asChild
                      className="h-auto min-h-9 w-full justify-center gap-1.5 whitespace-normal px-3 py-2 text-center text-[11px] leading-snug sm:text-xs"
                    >
                      <a href={sessionizeUrl} target="_blank" rel="noopener noreferrer">
                        {t('speakingSection.sessionizeCta')}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      </a>
                    </Button>
                  ) : null}
                  {calendlyUrl ? (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="h-auto min-h-9 w-full justify-center gap-1.5 whitespace-normal px-3 py-2 text-center text-[11px] leading-snug sm:text-xs"
                    >
                      <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
                        <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {t('speakingSection.calendlyCta')}
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.08} className="min-w-0 lg:col-start-3 lg:row-start-1">
              <div className="border-t border-border/40 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div className="relative mx-auto aspect-[16/10] w-full max-h-56 overflow-hidden rounded-xl bg-muted/40 ring-1 ring-border/50 sm:max-h-none lg:mx-0 lg:aspect-[4/5] lg:max-h-[17.5rem]">
                  <Image
                    src={speakingImage}
                    alt={t('homePhotos.cursor.alt')}
                    fill
                    sizes="(max-width: 1023px) 100vw, 176px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-left" delay={0.12} className="min-w-0 lg:col-start-2 lg:row-start-1">
              <div className="min-w-0 border-t border-border/40 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('speakingSection.topicsLabel')}
                </p>
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {topics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className={cn(
                        'w-full justify-center whitespace-normal rounded-full border-border/60 bg-background/50 px-2.5 py-1.5 text-[11px] font-normal leading-snug sm:w-auto sm:max-w-full sm:justify-start sm:py-1 sm:text-xs',
                        'transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                      )}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
                <Link
                  href="/#conferences"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
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
