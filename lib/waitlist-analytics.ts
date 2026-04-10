import type { WaitlistEntry } from '@/types/waitlist';

export type WaitlistAnalyticsDay = { date: string; count: number };
export type WaitlistAnalyticsHeard = { key: string; count: number };
export type WaitlistAnalyticsCommunity = { name: string; count: number };

export type WaitlistAnalytics = {
  sampleSize: number;
  totalInFirestore: number;
  dateRange: { from: string | null; to: string | null };
  byDay: WaitlistAnalyticsDay[];
  byHeardFrom: WaitlistAnalyticsHeard[];
  topCommunities: WaitlistAnalyticsCommunity[];
};

function isoDayUtc(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/** Agregados a partir de la misma muestra que lista el panel (p. ej. hasta 500 filas). */
export function buildWaitlistAnalytics(
  entries: WaitlistEntry[],
  totalInFirestore: number
): WaitlistAnalytics {
  const byDayMap = new Map<string, number>();
  const heardMap = new Map<string, number>();
  const orgMap = new Map<string, number>();

  let minD: string | null = null;
  let maxD: string | null = null;

  for (const e of entries) {
    const day = isoDayUtc(e.createdAt);
    if (day) {
      byDayMap.set(day, (byDayMap.get(day) ?? 0) + 1);
      if (!minD || day < minD) minD = day;
      if (!maxD || day > maxD) maxD = day;
    }

    const h = e.heardFrom?.trim() ?? '';
    heardMap.set(h, (heardMap.get(h) ?? 0) + 1);

    const org = e.organization?.trim();
    if (org) {
      orgMap.set(org, (orgMap.get(org) ?? 0) + 1);
    }
  }

  const byDay = Array.from(byDayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

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
    dateRange: { from: minD, to: maxD },
    byDay,
    byHeardFrom,
    topCommunities,
  };
}
