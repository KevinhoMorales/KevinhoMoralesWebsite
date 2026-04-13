'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/components/i18n/locale-provider'
import { ScrollReveal } from '@/components/scroll-reveal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Quote } from 'lucide-react'
import type { Testimonial } from '@/types'
import { cn } from '@/lib/utils'

interface RecommendationsProps {
  testimonials: Testimonial[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Recommendations({ testimonials }: RecommendationsProps) {
  const { t } = useI18n()
  const loop = useMemo(() => [...testimonials, ...testimonials], [testimonials])

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section
      id="recommendations"
      data-analytics-section="recommendations"
      className="overflow-x-hidden py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-8 sm:mb-10 text-center">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">
            {t('recommendations.kicker')}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">{t('recommendations.title')}</h2>
        </ScrollReveal>

        <div
          className={cn(
            'group/carousel relative -mx-4 sm:-mx-6 md:-mx-8',
            'motion-reduce:overflow-x-auto motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:pb-2 motion-reduce:px-1'
          )}
        >
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-16 bg-gradient-to-r from-background to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-16 bg-gradient-to-l from-background to-transparent"
            aria-hidden
          />

          <div className="overflow-hidden motion-reduce:overflow-x-auto motion-reduce:snap-x">
            <div
              className={cn(
                'flex w-max items-start gap-4 sm:gap-5 py-2',
                'motion-safe:animate-testimonials-marquee motion-safe:group-hover/carousel:[animation-play-state:paused]'
              )}
            >
              {loop.map((item, index) => {
                const card = (
                  <Card
                    className={cn(
                      'bg-card/50 border-border/50 h-full transition-all duration-300 ease-out',
                      'hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 hover:border-primary/35'
                    )}
                  >
                    <CardContent className="p-3 sm:p-4 space-y-2">
                      <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-primary/30 shrink-0" />
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed italic">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3 pt-1">
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 border border-primary/20">
                          <AvatarImage src={item.avatar} alt="" />
                          <AvatarFallback className="bg-secondary text-[10px] sm:text-xs">
                            {getInitials(item.author)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 text-left">
                          <p
                            className={cn(
                              'font-semibold text-sm truncate',
                              item.linkedinUrl && 'group-hover:text-primary transition-colors'
                            )}
                          >
                            {item.author}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.role}
                            {item.company && ` at ${item.company}`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )

                return (
                  <article
                    key={`${item.id}-${index}`}
                    className="motion-reduce:snap-start motion-reduce:snap-always shrink-0 w-[280px] sm:w-[300px] md:w-[360px]"
                  >
                    {item.linkedinUrl ? (
                      <a
                        href={item.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'group block h-full rounded-xl outline-none',
                          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                        )}
                        aria-label={t('recommendations.linkedInCardAria', { name: item.author })}
                      >
                        {card}
                      </a>
                    ) : (
                      card
                    )}
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
