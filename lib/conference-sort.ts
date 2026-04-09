import type { Conference } from '@/types/conference';

/**
 * Clave numérica para ordenar por fecha del evento (mayor = más reciente).
 * Texto libre en admin: ISO, fechas parseables por JS, o año (p. ej. "DevFest 2023").
 */
function eventDateSortKey(dateStr: string | undefined): number {
  const s = (dateStr ?? '').trim();
  if (!s) return Number.NEGATIVE_INFINITY;

  const isoDay = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDay) {
    const t = Date.UTC(Number(isoDay[1]), Number(isoDay[2]) - 1, Number(isoDay[3]));
    if (!Number.isNaN(t)) return t;
  }

  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) return parsed;

  const yearMatch = s.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const y = Number.parseInt(yearMatch[0], 10);
    return Date.UTC(y, 6, 1);
  }

  return Number.NEGATIVE_INFINITY;
}

function isoDescCompare(a: string | undefined, b: string | undefined): number {
  const ca = (a ?? '').trim();
  const cb = (b ?? '').trim();
  if (ca === cb) return 0;
  if (ca && cb) return cb.localeCompare(ca);
  if (ca) return -1;
  if (cb) return 1;
  return 0;
}

/**
 * Orden público y admin: por **fecha del evento** (más nueva primero).
 * Misma fecha de evento: `updatedAt` → `createdAt` → título (evita orden solo alfabético).
 * Sin fecha de evento: al final.
 */
export function sortConferencesForDisplay(list: Conference[]): Conference[] {
  return [...list].sort((a, b) => {
    const ka = eventDateSortKey(a.date);
    const kb = eventDateSortKey(b.date);
    if (ka !== kb) return kb - ka;

    const u = isoDescCompare(a.updatedAt, b.updatedAt);
    if (u !== 0) return u;

    const c = isoDescCompare(a.createdAt, b.createdAt);
    if (c !== 0) return c;

    return a.title.localeCompare(b.title);
  });
}
