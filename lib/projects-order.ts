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

/** Timestamp UTC para ordenar; null si no hay fecha utilizable. */
function releaseDateSortMs(project: Project): number | null {
  const r = project.releaseDate?.trim()
  if (!r) return null
  const ymd = r.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (ymd) {
    const y = Number(ymd[1])
    const mo = Number(ymd[2])
    const d = Number(ymd[3])
    const t = Date.UTC(y, mo - 1, d)
    return Number.isNaN(t) ? null : t
  }
  const parsed = Date.parse(r)
  return Number.isNaN(parsed) ? null : parsed
}

/**
 * Listados: más reciente primero (`releaseDate`), luego `sortOrder` (mayor = más nuevo en seeds),
 * luego orden de entrada. Sin fecha van después de los que tienen fecha.
 */
export function orderProjectsForDisplay(projects: Project[]): Project[] {
  if (projects.length === 0) return []
  const indexed = projects.map((p, i) => ({ p, i }))
  return indexed
    .sort((a, b) => {
      const da = releaseDateSortMs(a.p)
      const db = releaseDateSortMs(b.p)
      if (da != null && db != null) {
        if (db !== da) return db - da
      } else if (da != null && db == null) {
        return -1
      } else if (da == null && db != null) {
        return 1
      }

      const ao = a.p.sortOrder
      const bo = b.p.sortOrder
      if (ao != null && bo != null && bo !== ao) return bo - ao
      if (ao != null && bo == null) return -1
      if (ao == null && bo != null) return 1
      return a.i - b.i
    })
    .map(({ p }) => p)
}
