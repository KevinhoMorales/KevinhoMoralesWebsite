'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { SECTION_PADDING } from '@/lib/section-layout'
import { cn } from '@/lib/utils'
import { Heart, Code, Users, Mic, BookOpen, Rocket } from 'lucide-react'
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
      { icon: Rocket, title: t('about.hEntrepreneur'), description: t('about.hEntrepreneurDesc') },
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
      className={cn(SECTION_PADDING, 'bg-secondary/30')}
    >
      <div className="mx-auto max-w-6xl min-w-0 w-full">
        <ScrollReveal className="mb-4 sm:mb-6">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">{t('about.kicker')}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-balance">
            {t('about.title')}
          </h2>
        </ScrollReveal>

        <div className="grid w-full min-w-0 grid-cols-1 gap-y-6 sm:gap-y-10 lg:grid-cols-2 lg:items-stretch lg:gap-x-12 lg:gap-y-8 xl:gap-x-16">
          <div className="flex min-h-0 min-w-0 w-full flex-col space-y-4 sm:space-y-6 lg:h-full">
            <ScrollReveal variant="fade-up" delay={0.1} className="min-w-0 w-full">
              <div className="space-y-4 sm:space-y-6">
                <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">
                  {t('about.bioP1')}
                </p>
                <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">
                  {t('about.bioP2')}
                </p>
                <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">
                  {t('about.bioP3')}
                </p>
                <p className="text-sm sm:text-lg text-primary/90 italic">
                  &ldquo;{t('about.motto')}&rdquo;
                </p>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid w-full min-w-0 grid-cols-2 items-stretch gap-3 sm:gap-3 md:grid-cols-3 md:gap-4 lg:mt-auto lg:grid-cols-3 lg:pt-2 xl:pt-4">
              {highlights.map((item, index) => (
                <StaggerItem key={`${item.title}-${index}`} delay={index * 0.06} className="h-full min-w-0 w-full">
                  <Card className="h-full min-w-0 w-full gap-0 overflow-hidden border-border/50 bg-card/50 py-0">
                    <CardContent className="flex h-full min-w-0 flex-col items-center justify-center gap-1 px-2.5 py-3 text-center sm:px-3 sm:py-3.5">
                      <item.icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                      <p className="w-full font-semibold text-xs leading-tight sm:text-sm">{item.title}</p>
                      <p className="min-h-0 w-full text-[10px] leading-snug text-muted-foreground line-clamp-2 sm:min-h-[2.75rem] sm:text-xs sm:line-clamp-none">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <ScrollReveal variant="fade-up" delay={0.2} className="flex min-h-0 min-w-0 h-full w-full">
            <Card className="bg-card/50 border-border/50 overflow-hidden flex flex-col flex-1 min-h-0 w-full">
              <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                {profile.familyImage ? (
                  <>
                    <div className="relative flex-1 min-h-[220px] sm:min-h-[280px] lg:min-h-[360px] overflow-hidden">
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
