'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectDetailModal } from '@/components/project-detail-modal'
import { useI18n } from '@/components/i18n/locale-provider'
import { cn } from '@/lib/utils'
import { ExternalLink, FileText, Smartphone } from 'lucide-react'
import type { Project, ProjectCategory } from '@/types'
import { displayProjectForFilter } from '@/lib/project-display'

const MAX_VISIBLE_TECH = 3

type ProjectCardProps = {
  project: Project
  category: ProjectCategory | 'all'
}

function categoryLabel(category: ProjectCategory, t: (key: string) => string): string {
  const map: Record<ProjectCategory, string> = {
    ios: 'projects.ios',
    android: 'projects.android',
    web: 'projects.web',
    flutter: 'projects.flutter',
  }
  return t(map[category])
}

export function ProjectCard({ project, category }: ProjectCardProps) {
  const { t } = useI18n()
  const [caseStudyOpen, setCaseStudyOpen] = useState(false)
  const shown = displayProjectForFilter(project, category)
  const mainLink = shown.links[0]?.url || '#'
  const hasCaseStudy = Boolean(project.caseStudy)

  const { visibleTech, hiddenTechCount } = useMemo(() => {
    const tech = shown.technologies
    if (tech.length <= MAX_VISIBLE_TECH) {
      return { visibleTech: tech, hiddenTechCount: 0 }
    }
    return {
      visibleTech: tech.slice(0, MAX_VISIBLE_TECH),
      hiddenTechCount: tech.length - MAX_VISIBLE_TECH,
    }
  }, [shown.technologies])

  return (
    <>
      <Card
        className={cn(
          'group flex h-full flex-col gap-0 overflow-hidden border-border/50 bg-card/60 py-0',
          'shadow-sm transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5'
        )}
      >
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-muted/50 sm:aspect-[5/4]">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-muted/30 to-background">
              <Smartphone className="h-8 w-8 text-primary/40 sm:h-10 sm:w-10" aria-hidden />
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/90 via-card/10 to-transparent"
            aria-hidden
          />
          <Badge
            variant="secondary"
            className="absolute left-1.5 top-1.5 z-[1] rounded-md border-0 bg-background/85 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wide text-foreground shadow-sm backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:px-2 sm:py-0.5 sm:text-[10px]"
          >
            {categoryLabel(project.category, t)}
          </Badge>
        </div>

        <CardContent className="flex flex-1 flex-col gap-2 p-2.5 sm:gap-3 sm:p-3.5 md:p-4">
          <div className="min-h-0 flex-1 space-y-1 sm:space-y-1.5">
            <h3 className="line-clamp-1 text-xs font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary sm:line-clamp-2 sm:text-sm md:text-base">
              {project.title}
            </h3>
            <p className="hidden line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:block sm:min-h-[2.5rem] md:text-sm">
              {project.description}
            </p>
          </div>

          <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
            {visibleTech.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="rounded-full border-border/60 bg-background/60 px-2 py-0 text-[10px] font-normal sm:text-[11px]"
              >
                {tech}
              </Badge>
            ))}
            {hiddenTechCount > 0 ? (
              <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] text-muted-foreground">
                {t('projects.moreTech', { count: String(hiddenTechCount) })}
              </Badge>
            ) : null}
          </div>

          <div className="mt-auto flex items-center gap-1.5 border-t border-border/40 pt-2 sm:gap-2 sm:pt-2.5">
            {hasCaseStudy ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 flex-1 gap-1 px-2 text-[10px] sm:h-8 sm:gap-1.5 sm:px-3 sm:text-xs"
                  onClick={() => setCaseStudyOpen(true)}
                >
                  <FileText className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
                  <span className="hidden xs:inline sm:inline">{t('projects.viewCaseStudy')}</span>
                </Button>
                {mainLink !== '#' ? (
                  <Button size="sm" variant="outline" className="h-7 shrink-0 px-2 sm:h-8 sm:px-2.5" asChild>
                    <a
                      href={mainLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('projects.viewProject')}
                    >
                      <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
                    </a>
                  </Button>
                ) : null}
              </>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="h-7 w-full gap-1 px-2 text-[10px] sm:h-8 sm:gap-1.5 sm:px-3 sm:text-xs"
                asChild
              >
                <a href={mainLink} target="_blank" rel="noopener noreferrer">
                  <span className="hidden xs:inline sm:inline">{t('projects.viewProject')}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ProjectDetailModal project={project} open={caseStudyOpen} onClose={() => setCaseStudyOpen(false)} />
    </>
  )
}
