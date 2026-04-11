'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { useI18n } from '@/components/i18n/locale-provider'
import { cn } from '@/lib/utils'
import { ArrowRight, ExternalLink } from 'lucide-react'
import type { MergedExperience } from '@/types'

interface ExperienceProps {
  experiences: MergedExperience[]
  /** En la home: solo los primeros `previewLimit` bloques; el resto en `/experience` */
  previewLimit?: number
}

export function ExperienceSection({ experiences, previewLimit }: ExperienceProps) {
  const { t } = useI18n()

  const visible =
    previewLimit != null ? experiences.slice(0, previewLimit) : experiences
  const showFullPageLink =
    previewLimit != null && experiences.length > previewLimit

  return (
    <section
      id="experience"
      data-analytics-section="experience"
      className="py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-8 sm:mb-10">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">{t('experience.kicker')}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
            {t('experience.title')}
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {visible.map((block, index) => (
            <StaggerItem key={block.id} delay={index * 0.05} className="w-full min-h-0 h-full">
              <article
                className={cn(
                  'relative flex h-full min-h-[11rem] flex-col overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 via-card/70 to-muted/20',
                  'shadow-sm shadow-black/[0.03] dark:shadow-black/20',
                  'p-4 sm:p-5',
                  'transition-[box-shadow,transform] duration-300 hover:shadow-md hover:border-border/80'
                )}
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/[0.06] blur-2xl" aria-hidden />
                {/* Móvil: cabecera en fila; sm+: dos columnas (empresa | roles) */}
                <div className="relative flex flex-1 flex-col gap-4 sm:flex-row sm:gap-5 sm:items-start">
                  <div className="flex shrink-0 flex-row items-center gap-3 sm:w-[min(42%,11rem)] sm:flex-col sm:items-stretch sm:gap-3">
                    {block.companyUrl ? (
                      <a
                        href={block.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-w-0 flex-1 flex-row items-center gap-3 rounded-xl text-left outline-offset-2 transition-colors hover:text-primary focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring sm:w-full sm:flex-col sm:items-stretch sm:gap-3"
                        aria-label={t('experience.companySiteAria', { name: block.company })}
                      >
                        {block.companyLogo ? (
                          <div className="relative h-12 w-12 shrink-0 rounded-2xl overflow-hidden bg-background/80 border border-border/60 shadow-inner">
                            <Image
                              src={block.companyLogo}
                              alt=""
                              fill
                              className="object-contain scale-110 p-0.5"
                              sizes="48px"
                            />
                          </div>
                        ) : null}
                        <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary sm:flex-none">
                          <span className="inline-flex items-start gap-1.5">
                            {block.company}
                            <ExternalLink
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary"
                              aria-hidden
                            />
                          </span>
                        </h3>
                      </a>
                    ) : (
                      <>
                        {block.companyLogo ? (
                          <div className="relative h-12 w-12 shrink-0 rounded-2xl overflow-hidden bg-background/80 border border-border/60 shadow-inner">
                            <Image
                              src={block.companyLogo}
                              alt={block.company}
                              fill
                              className="object-contain scale-110 p-0.5"
                              sizes="48px"
                            />
                          </div>
                        ) : null}
                        <h3 className="min-w-0 flex-1 text-left text-base font-semibold leading-snug tracking-tight text-foreground sm:flex-none">
                          {block.company}
                        </h3>
                      </>
                    )}
                  </div>

                  <ul className="min-w-0 flex-1 space-y-2.5 border-l-2 border-primary/25 pl-3.5 sm:space-y-3 sm:pl-4">
                    {block.roles.map((role, ri) => (
                      <li key={`${role.role}-${role.startDate}-${ri}`}>
                        <p className="font-medium text-sm text-foreground leading-snug">{role.role}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed sm:text-[0.8125rem]">
                          {role.startDate} — {role.current ? t('common.present') : role.endDate || '—'} · {role.type}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {showFullPageLink ? (
          <ScrollReveal delay={0.12} className="mt-8 sm:mt-10 flex justify-center">
            <Button variant="outline" size="lg" className="gap-2 rounded-xl" asChild>
              <Link href="/experience">
                {t('projects.seeMore')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </ScrollReveal>
        ) : null}
      </div>
    </section>
  )
}
