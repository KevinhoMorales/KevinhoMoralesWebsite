'use client'

import { useMemo } from 'react'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { SECTION_PADDING } from '@/lib/section-layout'
import { cn } from '@/lib/utils'
import { getSkillIcon } from '@/lib/skill-icons'
import type { SkillCategory } from '@/types'

type SkillsSectionProps = {
  categories: SkillCategory[]
}

function SkillPill({ name }: { name: string }) {
  const Icon = getSkillIcon(name)

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5',
        'text-xs font-medium text-foreground/90 backdrop-blur-sm'
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      {name}
    </span>
  )
}

export function SkillsSection({ categories }: SkillsSectionProps) {
  const { t } = useI18n()

  const skills = useMemo(() => {
    const seen = new Set<string>()
    const items: string[] = []
    categories.forEach((category) => {
      category.skills.forEach((name) => {
        if (seen.has(name)) return
        seen.add(name)
        items.push(name)
      })
    })
    return items
  }, [categories])

  const loop = useMemo(() => [...skills, ...skills], [skills])

  if (skills.length === 0) return null

  return (
    <section
      id="skills"
      data-analytics-section="skills"
      className={SECTION_PADDING}
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-2 sm:mb-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <p className="text-primary font-medium tracking-wide uppercase text-[10px] sm:text-xs">
                {t('skillsSection.kicker')}
              </p>
              <h2 className="text-lg sm:text-xl font-bold leading-tight">{t('skillsSection.title')}</h2>
            </div>
            <p className="shrink-0 text-[11px] tabular-nums text-muted-foreground sm:text-xs">
              {t('skillsSection.skillCount', { count: String(skills.length) })}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div
            className={cn(
              'group/skills relative overflow-hidden rounded-xl border border-border/50 bg-card/30',
              'motion-reduce:overflow-x-auto motion-reduce:snap-x motion-reduce:snap-mandatory'
            )}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-12 bg-gradient-to-r from-card/95 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-12 bg-gradient-to-l from-card/95 to-transparent"
              aria-hidden
            />

            <div className="overflow-hidden py-2.5 motion-reduce:overflow-x-auto motion-reduce:px-3">
              <div
                className={cn(
                  'flex w-max items-center gap-2 sm:gap-2.5',
                  'motion-safe:animate-skills-marquee motion-safe:group-hover/skills:[animation-play-state:paused]'
                )}
              >
                {loop.map((name, index) => (
                  <SkillPill key={`${name}-${index}`} name={name} />
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
