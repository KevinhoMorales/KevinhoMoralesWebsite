'use client'

import { useMemo } from 'react'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { getSkillOfficialUrl } from '@/lib/skill-official-urls'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import type { SkillCategory } from '@/types'

type SkillItem = {
  name: string
  url?: string
}

type SkillsSectionProps = {
  categories: SkillCategory[]
}

function SkillPill({ skill, className }: { skill: SkillItem; className?: string }) {
  const { t } = useI18n()
  const label = t('skillsSection.visitOfficial', { name: skill.name })

  const pillClass = cn(
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5',
    'text-xs font-medium text-foreground/90 backdrop-blur-sm',
    'transition-colors duration-200',
    skill.url
      ? 'hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring'
      : 'cursor-default',
    className
  )

  if (skill.url) {
    return (
      <a
        href={skill.url}
        target="_blank"
        rel="noopener noreferrer"
        className={pillClass}
        aria-label={label}
      >
        {skill.name}
        <ExternalLink className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
      </a>
    )
  }

  return <span className={pillClass}>{skill.name}</span>
}

export function SkillsSection({ categories }: SkillsSectionProps) {
  const { t } = useI18n()

  const skills = useMemo(() => {
    const seen = new Set<string>()
    const items: SkillItem[] = []
    categories.forEach((category) => {
      category.skills.forEach((name) => {
        if (seen.has(name)) return
        seen.add(name)
        items.push({ name, url: getSkillOfficialUrl(name) })
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
      className="py-2 sm:py-3 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
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
                {loop.map((skill, index) => (
                  <SkillPill key={`${skill.name}-${index}`} skill={skill} />
                ))}
              </div>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground sm:text-xs">
            {t('skillsSection.marqueeHint')}
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
