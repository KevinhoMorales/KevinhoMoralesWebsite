'use client'

import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/i18n/locale-provider'
import { ExternalLink, Smartphone } from 'lucide-react'
import type { Project } from '@/types'

type ProjectDetailModalProps = {
  project: Project | null
  open: boolean
  onClose: () => void
}

export function ProjectDetailModal({ project, open, onClose }: ProjectDetailModalProps) {
  const { t } = useI18n()
  const cs = project?.caseStudy
  if (!project || !cs) return null

  const mainLink = project.links[0]?.url

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[min(90dvh,880px)] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="max-h-[min(90dvh,880px)] overflow-y-auto">
          <div className="aspect-video relative bg-secondary">
            {project.image ? (
              <Image src={project.image} alt={project.title} fill className="object-cover" sizes="640px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Smartphone className="h-12 w-12 text-primary/50" aria-hidden />
              </div>
            )}
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl sm:text-2xl pr-8">{project.title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">{project.description}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="bg-primary/10 text-primary">
                  {tech}
                </Badge>
              ))}
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h4 className="mb-1 font-semibold text-foreground">{t('projects.caseStudyProblem')}</h4>
                <p className="text-muted-foreground whitespace-pre-line">{cs.problem}</p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-foreground">{t('projects.caseStudyApproach')}</h4>
                <p className="text-muted-foreground whitespace-pre-line">{cs.approach}</p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-foreground">{t('projects.caseStudyImpact')}</h4>
                <p className="text-muted-foreground whitespace-pre-line">{cs.impact}</p>
              </div>
              {cs.highlights && cs.highlights.length > 0 ? (
                <div>
                  <h4 className="mb-2 font-semibold text-foreground">{t('projects.caseStudyHighlights')}</h4>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {cs.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {mainLink ? (
              <Button className="gap-2" asChild>
                <a href={mainLink} target="_blank" rel="noopener noreferrer">
                  {t('projects.viewProject')}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
