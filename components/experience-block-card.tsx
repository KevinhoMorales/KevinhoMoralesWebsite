'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/components/i18n/locale-provider'
import { cn } from '@/lib/utils'
import { Calendar, ExternalLink } from 'lucide-react'
import type { ExperienceRoleLine, MergedExperience } from '@/types'

type ExperienceBlockCardProps = {
  block: MergedExperience
}

const DESCRIPTION_COLLAPSE_THRESHOLD = 180

function companyInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

function employmentTypeLabel(type: ExperienceRoleLine['type'], t: (key: string) => string): string {
  const map = {
    'full-time': 'fullTime',
    'part-time': 'partTime',
    freelance: 'freelance',
  } as const
  return t(`experience.employmentType.${map[type]}`)
}

function CompanyLogo({ block }: { block: MergedExperience }) {
  if (block.companyLogo) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-background/80 ring-1 ring-border/60 shadow-inner">
        <Image
          src={block.companyLogo}
          alt=""
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>
    )
  }

  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20"
      aria-hidden
    >
      {companyInitials(block.company)}
    </div>
  )
}

function CompanyHeader({ block }: { block: MergedExperience }) {
  const { t } = useI18n()
  const hasCurrentRole = block.roles.some((role) => role.current)

  const title = (
    <h3 className="min-w-0 text-base font-semibold leading-snug tracking-tight text-foreground">
      <span className="inline-flex items-start gap-1.5">
        <span className="text-balance">{block.company}</span>
        {block.companyUrl ? (
          <ExternalLink
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/company:opacity-100 group-focus-visible/company:opacity-100"
            aria-hidden
          />
        ) : null}
      </span>
    </h3>
  )

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      {block.companyUrl ? (
        <a
          href={block.companyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/company rounded-lg text-left outline-offset-2 transition-colors hover:text-primary focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('experience.companySiteAria', { name: block.company })}
        >
          {title}
        </a>
      ) : (
        title
      )}
      {block.companyFormerName ? (
        <p className="text-xs text-muted-foreground leading-snug">
          {t('experience.formerlyKnownAs', { name: block.companyFormerName })}
        </p>
      ) : null}
      {hasCurrentRole ? (
        <Badge variant="secondary" className="w-fit rounded-md border border-primary/20 bg-primary/10 text-[11px] text-primary">
          {t('experience.currentRole')}
        </Badge>
      ) : null}
    </div>
  )
}

function RoleDescription({ description }: { description: string }) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const isLong = description.length > DESCRIPTION_COLLAPSE_THRESHOLD

  return (
    <div className="mt-2">
      <p
        className={cn(
          'text-xs leading-relaxed text-muted-foreground sm:text-sm whitespace-pre-line',
          isLong && !expanded && 'line-clamp-4'
        )}
      >
        {description}
      </p>
      {isLong ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0 py-0.5 text-xs text-primary"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? t('experience.readLess') : t('experience.readMore')}
        </Button>
      ) : null}
    </div>
  )
}

export function ExperienceBlockCard({ block }: ExperienceBlockCardProps) {
  const { t } = useI18n()

  return (
    <Card
      className={cn(
        'group h-full min-h-[11rem] gap-0 overflow-hidden border-border/50 bg-card/50 py-0',
        'transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
      )}
    >
      <CardContent className="relative p-4 sm:p-5">
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/[0.05] blur-2xl"
          aria-hidden
        />

        <div className="relative flex items-start gap-3">
          <CompanyLogo block={block} />
          <CompanyHeader block={block} />
        </div>

        <ol className="relative mt-4 ml-[1.65rem] space-y-4 border-l border-primary/20 pl-4">
          {block.roles.map((role, ri) => {
            const roleKey = `${block.id}-${role.role}-${role.startDate}-${ri}`
            return (
              <li key={roleKey} className="relative">
                <span
                  className={cn(
                    'absolute -left-[calc(1rem+1px)] top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full ring-2 ring-card',
                    role.current ? 'bg-primary' : 'bg-muted-foreground/40'
                  )}
                  aria-hidden
                />
                <p className="font-medium text-sm leading-snug text-foreground">{role.role}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground sm:text-[0.8125rem]">
                    <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                    {role.startDate} — {role.current ? t('common.present') : role.endDate || '—'}
                  </span>
                  <Badge variant="outline" className="rounded-md text-[10px] font-medium uppercase tracking-wide">
                    {employmentTypeLabel(role.type, t)}
                  </Badge>
                </div>
                {role.description ? (
                  <RoleDescription description={role.description} />
                ) : null}
                {role.roleUrl ? (
                  <a
                    href={role.roleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {t('experience.viewProfile')}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                ) : null}
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
