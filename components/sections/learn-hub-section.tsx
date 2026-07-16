'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FilterChipRow, filterChipClass } from '@/components/ui/filter-chip-row'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { handleHomeHashLinkClick } from '@/lib/section-scroll'
import { MOTION_EASE } from '@/lib/motion'
import { ArrowRight, ExternalLink, GraduationCap } from 'lucide-react'
import type { LearnHubItem, LearnHubItemType } from '@/types'

type LearnHubSectionProps = {
  items: LearnHubItem[]
}

const FILTERS: LearnHubItemType[] = ['courses', 'writing', 'podcast', 'book']

export function LearnHubSection({ items }: LearnHubSectionProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const reducedMotion = useReducedMotion() ?? false
  const [activeFilter, setActiveFilter] = useState<LearnHubItemType | 'all'>('all')

  const filtered = useMemo(
    () => (activeFilter === 'all' ? items : items.filter((item) => item.type === activeFilter)),
    [items, activeFilter]
  )

  const filterLabel = (type: LearnHubItemType | 'all') => {
    const map = {
      all: 'learnHubSection.filterAll',
      courses: 'learnHubSection.filterCourses',
      writing: 'learnHubSection.filterWriting',
      podcast: 'learnHubSection.filterPodcast',
      book: 'learnHubSection.filterBook',
    } as const
    return t(map[type])
  }

  if (items.length === 0) return null

  return (
    <section
      id="learn"
      data-analytics-section="learn"
      className="py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/20"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-6 sm:mb-8">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" aria-hidden />
            {t('learnHubSection.kicker')}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">{t('learnHubSection.title')}</h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t('learnHubSection.description')}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.08} className="mb-4 sm:mb-6">
          <FilterChipRow>
            {(['all', ...FILTERS] as const).map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant={activeFilter === filter ? 'default' : 'outline'}
                onClick={() => setActiveFilter(filter)}
                className={filterChipClass}
              >
                {filterLabel(filter)}
              </Button>
            ))}
          </FilterChipRow>
        </ScrollReveal>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={activeFilter}
            initial={reducedMotion ? false : { opacity: 1, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 1, y: -8 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.35, ease: MOTION_EASE }
            }
          >
            <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 sm:gap-6">
              {filtered.map((item, index) => (
                <StaggerItem key={item.id} staggerIndex={index} className="h-full">
                  <Card className="h-full border-border/50 bg-card/50 transition-colors hover:border-primary/40">
                    <CardContent className="flex h-full flex-col gap-3 p-3 sm:p-4 md:p-5">
                      <div className="flex items-start gap-3">
                        {item.image ? (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background ring-1 ring-border/60">
                            <Image src={item.image} alt="" fill className="object-cover" sizes="48px" />
                          </div>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <Badge variant="secondary" className="mb-2 text-[10px] uppercase">
                            {filterLabel(item.type)}
                          </Badge>
                          <h3 className="font-semibold text-base leading-snug">{item.title}</h3>
                        </div>
                      </div>
                      <p className="flex-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      <div className="pt-1">
                        {item.internalLink ? (
                          <Button size="sm" className="gap-1.5" asChild>
                            <Link
                              href={item.internalLink}
                              onClick={(e) => handleHomeHashLinkClick(e, pathname, item.internalLink!)}
                            >
                              {t('learnHubSection.visitOnSite')}
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                            </Link>
                          </Button>
                        ) : item.url ? (
                          <Button size="sm" className="gap-1.5" asChild>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              {t('learnHubSection.visitLink')}
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
