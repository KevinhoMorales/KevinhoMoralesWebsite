'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { Heart, Code, Users, Mic, BookOpen } from 'lucide-react'
import type { Profile } from '@/types'

interface AboutProps {
  profile: Profile
}

export function About({ profile }: AboutProps) {
  const { t } = useI18n()

  const highlights = useMemo(
    () => [
      { icon: Code, title: t('about.hYears'), description: t('about.hYearsDesc') },
      { icon: Users, title: t('about.hCommunity'), description: t('about.hCommunityDesc') },
      { icon: Mic, title: t('about.hSpeaker'), description: t('about.hSpeakerDesc') },
      { icon: BookOpen, title: t('about.hBook'), description: t('about.hBookDesc') },
      { icon: Heart, title: t('about.hPassion'), description: t('about.hPassionDesc') },
    ],
    [t]
  )

  return (
    <section
      id="about"
      data-analytics-section="about"
      className="py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-4 sm:mb-6">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">{t('about.kicker')}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-balance">
            {t('about.title')}
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-10 gap-x-0 lg:gap-x-12 xl:gap-x-16 lg:gap-y-8 lg:items-stretch">
          <ScrollReveal variant="fade-right" delay={0.1} className="flex min-h-0 flex-col space-y-4 sm:space-y-6">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t('about.bioP1')}
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t('about.bioP2')}
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t('about.bioP3')}
            </p>
            <p className="text-base sm:text-lg text-primary/90 italic">
              &ldquo;{t('about.motto')}&rdquo;
            </p>

            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-4 sm:pt-6 items-start">
              {highlights.map((item, index) => (
                <StaggerItem key={`${item.title}-${index}`} delay={index * 0.06} className="min-h-0 w-full">
                  <Card className="bg-card/50 border-border/50 w-full">
                    <CardContent className="px-2.5 py-3 sm:px-3 sm:py-3.5 text-center flex flex-col gap-1">
                      <item.icon className="h-5 w-5 sm:h-5 sm:w-5 text-primary mx-auto shrink-0" />
                      <p className="font-semibold text-xs sm:text-sm leading-tight">{item.title}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </ScrollReveal>

          <ScrollReveal variant="fade-left" delay={0.2} className="flex min-h-0 w-full lg:pl-0">
            <Card className="bg-card/50 border-border/50 overflow-hidden flex flex-col flex-1 min-h-0 w-full">
              <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                {profile.familyImage ? (
                  <>
                    <div className="relative flex-1 min-h-[280px] lg:min-h-[360px] overflow-hidden">
                      <Image
                        src={profile.familyImage}
                        alt={t('about.familyAlt')}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-4 sm:p-6 shrink-0">
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        {t('about.myFamily')}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {t('about.familyBlurb')}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      {t('about.myFamily')}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {t('about.familyBlurb')}
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      {['Sofia', 'Lucas', 'Emma'].map((name) => (
                        <div key={name} className="text-center">
                          <div className="h-16 w-16 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                            {name.slice(0, 2).toUpperCase()}
                          </div>
                          <p className="font-medium text-sm">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {name === 'Sofia' ? t('about.partner') : name === 'Lucas' ? t('about.son') : t('about.daughter')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
