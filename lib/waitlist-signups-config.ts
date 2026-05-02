/**
 * Registro en lista de espera del libro (Firestore / Web3Forms).
 * Por defecto acepta envíos. Para cerrar modal y API sin redeploy de lógica:
 * NEXT_PUBLIC_WAITLIST_OPEN=false
 */
export function isWaitlistAcceptingSubmissions(): boolean {
  const v = process.env.NEXT_PUBLIC_WAITLIST_OPEN?.trim().toLowerCase();
  return v !== 'false' && v !== '0' && v !== 'no';
}

/** Tras esta fecha (UTC), el modal de lista de espera no se abre solo en la home. */
const WAITLIST_AUTO_POPUP_END_MS = Date.UTC(2026, 4, 1, 0, 0, 0);

export function isWaitlistAutoPopupAllowed(): boolean {
  if (!isWaitlistAcceptingSubmissions()) return false;
  return Date.now() < WAITLIST_AUTO_POPUP_END_MS;
}
