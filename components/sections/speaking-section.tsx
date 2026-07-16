'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { handleHomeHashLinkClick } from '@/lib/section-scroll'
import { Calendar, ExternalLink, Mic } from 'lucide-react'
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
      className="py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-6 sm:mb-8">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 flex items-center gap-2">
            <Mic className="h-4 w-4" aria-hidden />
            {t('speakingSection.kicker')}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">{t('speakingSection.title')}</h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t('speakingSection.description')}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-8">
          <ScrollReveal variant="fade-right" delay={0.08}>
            <Card className="h-full border-border/50 bg-card/50">
              <CardContent className="flex h-full flex-col gap-4 p-5 sm:p-6">
                <div className="relative mx-auto h-24 w-40 sm:h-28 sm:w-48">
                  <Image
                    src="/images/sessionize-most-active-speaker-2024.png"
                    alt="Sessionize Most Active Speaker 2024"
                    fill
                    sizes="192px"
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {sessionizeUrl ? (
                    <Button asChild className="gap-2">
                      <a href={sessionizeUrl} target="_blank" rel="noopener noreferrer">
                        {t('speakingSection.sessionizeCta')}
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    </Button>
                  ) : null}
                  {calendlyUrl ? (
                    <Button variant="outline" asChild className="gap-2">
                      <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
                        <Calendar className="h-4 w-4" aria-hidden />
                        {t('speakingSection.calendlyCta')}
                      </a>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal variant="fade-left" delay={0.12}>
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">{t('speakingSection.topicsLabel')}</p>
              <StaggerContainer className="flex flex-wrap gap-2">
                {topics.map((topic, index) => (
                  <StaggerItem key={topic} delay={index * 0.05}>
                    <Badge variant="outline" className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">
                      {topic}
                    </Badge>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <p className="mt-4 text-sm text-muted-foreground">
                <Link
                  href="/#conferences"
                  className="text-primary hover:underline"
                  onClick={(e) => handleHomeHashLinkClick(e, pathname, '/#conferences')}
                >
                  {t('speakingSection.viewConferences')}
                </Link>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
