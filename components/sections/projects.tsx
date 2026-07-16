'use client'

import { useMemo, useState } from 'react'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { Button } from '@/components/ui/button'
import { FilterChipRow, filterChipClass } from '@/components/ui/filter-chip-row'
import { ProjectCard } from '@/components/project-card'
import { ProjectsModal } from '@/components/projects-modal'
import { useI18n } from '@/components/i18n/locale-provider'
import { Globe, Layers, Smartphone, ArrowRight } from 'lucide-react'
import { pickProjectsPreview } from '@/lib/projects-preview'
import type { Project, ProjectCategory } from '@/types'

const categoryIcons: Record<string, typeof Smartphone> = {
  all: Layers,
  ios: Smartphone,
  android: Smartphone,
  web: Globe,
  flutter: Smartphone,
}

interface ProjectsProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsProps) {
  const { t } = useI18n()
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [previewLimit] = useState(4)

  const categories: { id: ProjectCategory | 'all'; label: string }[] = useMemo(
    () => [
      { id: 'all', label: t('projects.all') },
      { id: 'ios', label: t('projects.ios') },
      { id: 'android', label: t('projects.android') },
      { id: 'web', label: t('projects.web') },
      { id: 'flutter', label: t('projects.flutter') },
    ],
    [t]
  )

  const { preview: filteredProjects, hasMore } = useMemo(
    () => pickProjectsPreview(projects, activeCategory, previewLimit),
    [projects, activeCategory, previewLimit]
  )

  return (
    <section
      id="projects"
      data-analytics-section="projects"
      className="py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-4 sm:mb-6">
          <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3">{t('projects.kicker')}</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
            {t('projects.title')}
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t('projects.description')}
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {t('projects.totalCount', { count: String(projects.length) })}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="mb-4 sm:mb-8">
          <FilterChipRow>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.id] || Layers
              return (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className={filterChipClass}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </Button>
              )
            })}
          </FilterChipRow>
        </ScrollReveal>

        {filteredProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('projects.emptyCategory')}</p>
        ) : (
          <StaggerContainer
            key={activeCategory}
            className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-4 md:gap-5"
          >
            {filteredProjects.map((project, index) => (
                <StaggerItem key={project.id} delay={index * 0.06} className="h-full min-w-0 w-full">
                  <ProjectCard project={project} category={activeCategory} />
                </StaggerItem>
              ))}
          </StaggerContainer>
        )}

        {hasMore ? (
          <ScrollReveal delay={0.12} className="mt-8 sm:mt-10 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="default"
              className="h-9 gap-2 rounded-xl sm:h-10"
              onClick={() => setModalOpen(true)}
            >
              {t('projects.seeMore')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </ScrollReveal>
        ) : null}
      </div>

      <ProjectsModal
        projects={projects}
        initialCategory={activeCategory}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
