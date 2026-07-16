'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { cn } from '@/lib/utils'
import { Cloud, Layers, Smartphone, Sparkles, type LucideIcon } from 'lucide-react'
import type { SkillCategory } from '@/types'

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  mobile: 'skillsSection.catMobile',
  architecture: 'skillsSection.catArchitecture',
  backend: 'skillsSection.catBackend',
  tools: 'skillsSection.catTools',
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  mobile: Smartphone,
  architecture: Layers,
  backend: Cloud,
  tools: Sparkles,
}

type SkillsSectionProps = {
  categories: SkillCategory[]
}

export function SkillsSection({ categories }: SkillsSectionProps) {
  const { t } = useI18n()

  const totalSkills = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.skills.length, 0),
    [categories]
  )

  if (categories.length === 0) return null

  return (
    <section
      id="skills"
      data-analytics-section="skills"
      className="py-3 sm:py-4 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-3 sm:mb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-primary font-medium tracking-wide uppercase text-[10px] sm:text-xs mb-1">
                {t('skillsSection.kicker')}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-balance leading-tight">
                {t('skillsSection.title')}
              </h2>
            </div>
            <p className="shrink-0 text-xs tabular-nums text-muted-foreground sm:text-right">
              {t('skillsSection.skillCount', { count: String(totalSkills) })}
            </p>
          </div>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-snug line-clamp-2">
            {t('skillsSection.description')}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <Card className="overflow-hidden border-border/50 bg-card/40 py-0 shadow-none backdrop-blur-sm">
            <CardContent className="divide-y divide-border/40 p-0">
              {categories.map((category) => {
                const labelKey = CATEGORY_LABEL_KEYS[category.id] ?? category.id
                const label = t(labelKey)
                const Icon = CATEGORY_ICONS[category.id] ?? Layers

                return (
                  <div
                    key={category.id}
                    className="group/row flex flex-col gap-2 px-3 py-2.5 sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-x-4 sm:px-4 sm:py-2.5"
                  >
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                        {label === labelKey ? category.id : label}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                      {category.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className={cn(
                            'rounded-full border-border/60 bg-background/50 px-2 py-0 text-[11px] font-normal text-foreground/90',
                            'transition-colors duration-200',
                            'hover:border-primary/40 hover:bg-primary/10 hover:text-primary'
                          )}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  )
}
