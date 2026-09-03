'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { SECTION_PADDING } from '@/lib/section-layout'
import { cn } from '@/lib/utils'
import { Building2, Clock, GraduationCap, Users } from 'lucide-react'

type MentorshipPlanId = 'oneOnOne' | 'group' | 'enterprise'

const PLAN_ICONS = {
  oneOnOne: GraduationCap,
  group: Users,
  enterprise: Building2,
} as const

export function MentorshipsSection() {
  const { t } = useI18n()

  const plans = useMemo(
    () =>
      (['oneOnOne', 'group', 'enterprise'] as MentorshipPlanId[]).map((id) => ({
        id,
        icon: PLAN_ICONS[id],
        title: t(`mentorships.${id}.title`),
        duration: t(`mentorships.${id}.duration`),
        price: t(`mentorships.${id}.price`),
        description: t(`mentorships.${id}.description`),
        highlights: [
          t(`mentorships.${id}.h1`),
          t(`mentorships.${id}.h2`),
          t(`mentorships.${id}.h3`),
        ],
        featured: id === 'oneOnOne',
      })),
    [t]
  )

  return (
    <section
      id="mentorships"
      data-analytics-section="mentorships"
      className={cn(SECTION_PADDING, 'bg-secondary/30')}
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-4 sm:mb-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-primary sm:text-sm">
            {t('mentorships.kicker')}
          </p>
          <h2 className="text-balance text-2xl font-bold sm:text-3xl md:text-4xl">
            {t('mentorships.title')}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
            {t('mentorships.description')}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.06} className="mb-5 sm:mb-6">
          <Card className="overflow-hidden border-primary/25 bg-card/70 py-0 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <Clock className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold sm:text-lg">{t('mentorships.intro.title')}</h3>
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-primary/20 bg-primary/10 text-[10px] font-medium uppercase tracking-wide text-primary"
                    >
                      {t('mentorships.intro.badge')}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t('mentorships.intro.body')}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-medium text-muted-foreground sm:text-right">
                {t('mentorships.intro.hint')}
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <StaggerItem key={plan.id} delay={index * 0.06} className="h-full min-w-0">
                <Card
                  className={cn(
                    'group h-full gap-0 overflow-hidden border-border/50 bg-card/60 py-0',
                    'transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                    'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
                    plan.featured && 'border-primary/35 ring-1 ring-primary/15'
                  )}
                >
                  <CardContent className="flex h-full flex-col p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      {plan.featured ? (
                        <Badge className="rounded-full bg-primary/15 text-[10px] font-medium text-primary hover:bg-primary/15">
                          {t('mentorships.popular')}
                        </Badge>
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-base font-semibold tracking-tight sm:text-lg">
                      {plan.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{plan.duration}</p>

                    <p className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {plan.price}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {plan.description}
                    </p>

                    <ul className="mt-4 space-y-2 border-t border-border/40 pt-4 text-sm text-muted-foreground">
                      {plan.highlights.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-auto pt-5 text-xs leading-relaxed text-muted-foreground/90">
                      {t('mentorships.uiOnlyHint')}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
