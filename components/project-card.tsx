'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectDetailModal } from '@/components/project-detail-modal'
import { useI18n } from '@/components/i18n/locale-provider'
import { ExternalLink, FileText, Smartphone } from 'lucide-react'
import type { Project, ProjectCategory } from '@/types'
import { displayProjectForFilter } from '@/lib/project-display'

type ProjectCardProps = {
  project: Project
  category: ProjectCategory | 'all'
}

export function ProjectCard({ project, category }: ProjectCardProps) {
  const { t } = useI18n()
  const [caseStudyOpen, setCaseStudyOpen] = useState(false)
  const shown = displayProjectForFilter(project, category)
  const mainLink = shown.links[0]?.url || '#'
  const hasCaseStudy = Boolean(project.caseStudy)

  return (
    <>
      <Card className="flex h-full flex-col bg-card/50 border-border/50 overflow-hidden group hover:border-primary/50 transition-colors">
        <div className="aspect-video shrink-0 bg-secondary relative overflow-hidden">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Smartphone className="h-12 w-12 text-primary/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
            {hasCaseStudy ? (
              <Button variant="secondary" size="sm" className="gap-2" onClick={() => setCaseStudyOpen(true)}>
                <FileText className="h-4 w-4" aria-hidden />
                {t('projects.viewCaseStudy')}
              </Button>
            ) : (
              <Button variant="secondary" size="sm" className="gap-2" asChild>
                <a href={mainLink} target="_blank" rel="noopener noreferrer">
                  {t('projects.viewProject')} <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
        <CardContent className="flex flex-1 flex-col justify-between gap-3 p-4 sm:p-6 sm:gap-4">
          <div className="min-h-0">
            <h3 className="line-clamp-2 font-semibold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {project.description}
            </p>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
            {shown.technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs bg-primary/10 text-primary">
                {tech}
              </Badge>
            ))}
            {hasCaseStudy ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-xs text-primary"
                onClick={() => setCaseStudyOpen(true)}
              >
                {t('projects.viewCaseStudy')}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <ProjectDetailModal project={project} open={caseStudyOpen} onClose={() => setCaseStudyOpen(false)} />
    </>
  )
}
