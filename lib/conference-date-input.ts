/** Convierte `Date` local a `YYYY-MM-DD` (evita desfases UTC con `toISOString`). */
function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Convierte el valor guardado en Firestore (texto libre o ISO) a `YYYY-MM-DD`
 * para usar en `<input type="date" />`. Si no es interpretable, devuelve "".
 */
export function conferenceDateToInputValue(raw: string | undefined): string {
  const s = (raw ?? '').trim();
  if (!s) return '';

  const isoDay = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDay) {
    const y = Number(isoDay[1]);
    const mo = Number(isoDay[2]);
    const day = Number(isoDay[3]);
    if (y >= 1000 && mo >= 1 && mo <= 12 && day >= 1 && day <= 31) {
      return `${y}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) {
    return toIsoDateLocal(new Date(parsed));
  }

  const yearMatch = s.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) return `${yearMatch[0]}-01-01`;

  return '';
}
