'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BrowseListModal } from '@/components/ui/browse-list-modal'
import { FilterChipRow, filterChipClass } from '@/components/ui/filter-chip-row'
import { ProjectCard } from '@/components/project-card'
import { useI18n } from '@/components/i18n/locale-provider'
import { Globe, Layers, Smartphone } from 'lucide-react'
import { orderProjectsForDisplay } from '@/lib/projects-order'
import { projectMatchesCategory } from '@/lib/project-category-match'
import { normalizeForSearch } from '@/lib/normalize-for-search'
import type { Project, ProjectCategory } from '@/types'

const categoryIcons: Record<string, typeof Smartphone> = {
  all: Layers,
  ios: Smartphone,
  android: Smartphone,
  web: Globe,
  flutter: Smartphone,
}

interface ProjectsModalProps {
  projects: Project[]
  initialCategory: ProjectCategory | 'all'
  open: boolean
  onClose: () => void
}

export function ProjectsModal({ projects, initialCategory, open, onClose }: ProjectsModalProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProjectCategory | 'all'>(initialCategory)

  useEffect(() => {
    if (open) setCategory(initialCategory)
  }, [open, initialCategory])

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

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

  const filteredProjects = useMemo(() => {
    const inCategory =
      category === 'all' ? [...projects] : projects.filter((p) => projectMatchesCategory(p, category))
    const ranked = orderProjectsForDisplay(inCategory)
    const q = normalizeForSearch(search.trim())
    if (!q) return ranked

    return ranked.filter((project) => {
      const haystack = normalizeForSearch(
        [project.title, project.description, ...(project.technologies ?? [])].join(' ')
      )
      return haystack.includes(q)
    })
  }, [projects, category, search])

  const toolbar = (
    <FilterChipRow>
      {categories.map((cat) => {
        const Icon = categoryIcons[cat.id] || Layers
        return (
          <Button
            key={cat.id}
            variant={category === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(cat.id)}
            className={filterChipClass}
          >
            <Icon className="h-4 w-4" />
            {cat.label}
          </Button>
        )
      })}
    </FilterChipRow>
  )

  return (
    <BrowseListModal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={t('projectsModal.title')}
      searchPlaceholder={t('projectsModal.searchPlaceholder')}
      searchValue={search}
      onSearchChange={setSearch}
      toolbar={toolbar}
      emptyMessage={search.trim() ? t('browseModal.noResults') : t('projects.emptyCategory')}
      isEmpty={filteredProjects.length === 0}
    >
      <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} category={category} />
        ))}
      </div>
    </BrowseListModal>
  )
}
