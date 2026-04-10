import type { WaitlistEntry } from '@/types/waitlist';

export type WaitlistAnalyticsHeard = { key: string; count: number };
export type WaitlistAnalyticsCommunity = { name: string; count: number };

export type WaitlistAnalytics = {
  sampleSize: number;
  totalInFirestore: number;
  byHeardFrom: WaitlistAnalyticsHeard[];
  topCommunities: WaitlistAnalyticsCommunity[];
};

/** Agregados a partir de la misma muestra que lista el panel (p. ej. hasta 500 filas). */
export function buildWaitlistAnalytics(
  entries: WaitlistEntry[],
  totalInFirestore: number
): WaitlistAnalytics {
  const heardMap = new Map<string, number>();
  const orgMap = new Map<string, number>();

  for (const e of entries) {
    const h = e.heardFrom?.trim() ?? '';
    heardMap.set(h, (heardMap.get(h) ?? 0) + 1);

    const org = e.organization?.trim();
    if (org) {
      orgMap.set(org, (orgMap.get(org) ?? 0) + 1);
    }
  }

  const byHeardFrom = Array.from(heardMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count }));

  const topCommunities = Array.from(orgMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, count]) => ({ name, count }));

  return {
    sampleSize: entries.length,
    totalInFirestore,
    byHeardFrom,
    topCommunities,
  };
}
