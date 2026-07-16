import type { Experience, MergedExperience, ExperienceRoleLine } from '@/types';

function normalizeCompanyKey(company: string): string {
  return company.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Orden YYYY-MM para comparar (más reciente = mayor). */
function ymValue(ym: string): number {
  const [y, m] = ym.split('-').map((x) => parseInt(x, 10));
  if (!Number.isFinite(y)) return 0;
  return y * 12 + (Number.isFinite(m) ? m : 1);
}

/**
 * Agrupa entradas con la misma empresa (nombre normalizado) y lista los roles
 * del más reciente al más antiguo. El orden entre empresas sigue el del JSON
 * (primera aparición de cada compañía en la lista original).
 */
export function mergeExperienceByCompany(experiences: Experience[]): MergedExperience[] {
  type Indexed = { exp: Experience; index: number };
  const buckets = new Map<string, Indexed[]>();

  experiences.forEach((exp, index) => {
    const key = normalizeCompanyKey(exp.company);
    const list = buckets.get(key) ?? [];
    list.push({ exp, index });
    buckets.set(key, list);
  });

  const groups: Array<{ merged: MergedExperience; minIndex: number }> = [];

  buckets.forEach((items) => {
    const minIndex = Math.min(...items.map((x) => x.index));
    const byRecency = [...items].sort((a, b) => ymValue(b.exp.startDate) - ymValue(a.exp.startDate));
    const firstInFile = [...items].sort((a, b) => a.index - b.index)[0].exp;

    const roles: ExperienceRoleLine[] = byRecency.map(({ exp }) => ({
      role: exp.role,
      type: exp.type,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      description: exp.description,
      roleUrl: exp.roleUrl,
    }));

    const canonicalId = [...items].sort((a, b) => a.index - b.index)[0].exp.id;

    groups.push({
      minIndex,
      merged: {
        id: `merged-${canonicalId}`,
        company: firstInFile.company,
        companyUrl: firstInFile.companyUrl,
        companyLogo: firstInFile.companyLogo,
        companyFormerName: firstInFile.companyFormerName,
        roles,
      },
    });
  });

  return groups.sort((a, b) => a.minIndex - b.minIndex).map((g) => g.merged);
}

/** Prioriza bloques con rol actual para preview en home; mantiene orden del JSON como desempate. */
export function sortExperienceForPreview(experiences: MergedExperience[]): MergedExperience[] {
  const order = new Map(experiences.map((block, index) => [block.id, index]))
  return [...experiences].sort((a, b) => {
    const aCurrent = a.roles.some((r) => r.current) ? 1 : 0
    const bCurrent = b.roles.some((r) => r.current) ? 1 : 0
    if (bCurrent !== aCurrent) return bCurrent - aCurrent
    return (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
  })
}
