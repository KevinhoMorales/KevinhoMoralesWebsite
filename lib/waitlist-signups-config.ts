/**
 * Registro en lista de espera del libro (Firestore / Web3Forms).
 * Solo actívalo cuando el flujo (p. ej. Payphone) esté listo:
 * NEXT_PUBLIC_WAITLIST_OPEN=true
 */
export function isWaitlistAcceptingSubmissions(): boolean {
  return process.env.NEXT_PUBLIC_WAITLIST_OPEN === 'true';
}
