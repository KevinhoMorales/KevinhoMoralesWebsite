import type { Project, ProjectCategory } from '@/types'
import { orderProjectsForDisplay } from '@/lib/projects-order'
import { projectMatchesCategory } from '@/lib/project-category-match'

const DEFAULT_HOME_LIMIT = 4

/**
 * Home preview: up to `limit` proyectos del filtro, ya ordenados por fecha (más reciente primero).
 */
export function pickProjectsPreview(
  projects: Project[],
  category: ProjectCategory | 'all',
  limit = DEFAULT_HOME_LIMIT
): { preview: Project[]; hasMore: boolean } {
  const inCategory =
    category === 'all' ? [...projects] : projects.filter((p) => projectMatchesCategory(p, category))
  const ranked = orderProjectsForDisplay(inCategory)
  const preview = ranked.slice(0, limit)
  const hasMore = inCategory.length > limit
  return { preview, hasMore }
}

export { DEFAULT_HOME_LIMIT }
