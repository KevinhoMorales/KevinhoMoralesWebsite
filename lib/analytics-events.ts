import { getFirebaseAnalytics } from '@/lib/firebase';

/** Parámetros GA4: solo string o number (límite del SDK). */
export type AnalyticsParams = Record<string, string | number>;

/**
 * Eventos personalizados para GA4 / Firebase Analytics.
 * Requiere `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` y Analytics soportado en el navegador.
 */
export async function logAnalyticsEvent(eventName: string, params?: AnalyticsParams): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const a = await getFirebaseAnalytics();
    if (!a) return;
    const { logEvent } = await import('firebase/analytics');
    const safe: Record<string, string | number> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null) continue;
        if (typeof v === 'boolean') safe[k] = v ? '1' : '0';
        else if (typeof v === 'number' || typeof v === 'string') safe[k] = v;
      }
    }
    logEvent(a, eventName, Object.keys(safe).length ? safe : undefined);
  } catch {
    /* Analytics opcional */
  }
}
