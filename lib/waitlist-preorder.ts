/** Fechas de preventa (ajusta aquí o mueve a env si necesitas otro ciclo). */
export const PREORDER_END = new Date(2026, 4, 31, 23, 59, 59, 999);
export const LAUNCH_DATE = new Date(2026, 5, 13, 12, 0, 0, 0);

export function formatPreorderDay(date: Date, localeTag = 'es'): string {
  return date.toLocaleDateString(localeTag, { day: 'numeric', month: 'long' });
}
