/** Fechas de preventa (ajusta aquí o mueve a env si necesitas otro ciclo). */
export const PREORDER_END = new Date(2026, 3, 30, 23, 59, 59, 999);
export const LAUNCH_DATE = new Date(2026, 4, 18, 12, 0, 0, 0);

/** Fecha mostrada en el mensaje de éxito del modal (correo con info de preventa). */
export const WAITLIST_SUCCESS_EMAIL_BY_DATE = new Date(2026, 4, 1, 23, 59, 59, 999);

export function formatPreorderDay(date: Date, localeTag = 'es'): string {
  return date.toLocaleDateString(localeTag, { day: 'numeric', month: 'long' });
}
