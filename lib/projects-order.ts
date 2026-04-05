import type { Project, ProjectCategory } from '@/types'

/** Valid category query values for /projects?category= */
export const PROJECT_CATEGORY_PARAMS: readonly ProjectCategory[] = [
  'ios',
  'android',
  'web',
  'flutter',
]

export function parseProjectsCategoryParam(raw: string | string[] | undefined): ProjectCategory | 'all' {
  const v = Array.isArray(raw) ? raw[0] : raw
  if (!v) return 'all'
  return PROJECT_CATEGORY_PARAMS.includes(v as ProjectCategory) ? (v as ProjectCategory) : 'all'
}

/**
 * Stable list order for listings. If any project has `sortOrder`, items with it come first (higher = newer),
 * then the rest in original order. If none have `sortOrder`, preserves input order (e.g. JSON / Firestore order).
 */
export function orderProjectsForDisplay(projects: Project[]): Project[] {
  if (projects.length === 0) return []
  const indexed = projects.map((p, i) => ({ p, i }))
  const hasSort = indexed.some(({ p }) => p.sortOrder != null)
  if (!hasSort) return [...projects]
  return indexed
    .sort((a, b) => {
      const ao = a.p.sortOrder
      const bo = b.p.sortOrder
      if (ao != null && bo != null && bo !== ao) return bo - ao
      if (ao != null && bo == null) return -1
      if (ao == null && bo != null) return 1
      return a.i - b.i
    })
    .map(({ p }) => p)
}
