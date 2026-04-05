/**
 * Registro en lista de espera del libro (Firestore / Web3Forms).
 * Por defecto acepta envíos. Para cerrar modal y API sin redeploy de lógica:
 * NEXT_PUBLIC_WAITLIST_OPEN=false
 */
export function isWaitlistAcceptingSubmissions(): boolean {
  const v = process.env.NEXT_PUBLIC_WAITLIST_OPEN?.trim().toLowerCase();
  return v !== 'false' && v !== '0' && v !== 'no';
}
