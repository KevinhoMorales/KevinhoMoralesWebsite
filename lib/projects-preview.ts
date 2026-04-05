import type { Project, ProjectCategory } from '@/types'
import { orderProjectsForDisplay } from '@/lib/projects-order'

const DEFAULT_HOME_LIMIT = 4

/**
 * Home preview: up to `limit` projects in `category`. Uses `orderProjectsForDisplay` on the filtered set, then
 * the first `limit` if any item has `sortOrder`, otherwise the last `limit` (append-newest in `projects.json`).
 */
export function pickProjectsPreview(
  projects: Project[],
  category: ProjectCategory | 'all',
  limit = DEFAULT_HOME_LIMIT
): { preview: Project[]; hasMore: boolean } {
  const inCategory =
    category === 'all' ? [...projects] : projects.filter((p) => p.category === category)
  const useSortOrder = inCategory.some((p) => p.sortOrder != null) // keep in sync with orderProjectsForDisplay
  const ranked = orderProjectsForDisplay(inCategory)
  const preview = useSortOrder ? ranked.slice(0, limit) : ranked.slice(-limit)
  const hasMore = inCategory.length > limit
  return { preview, hasMore }
}

export { DEFAULT_HOME_LIMIT }
