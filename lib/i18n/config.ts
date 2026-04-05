export const LOCALES = ['en', 'es', 'pt'] as const;

export type Locale = (typeof LOCALES)[number];

/** Fallback cuando el idioma del dispositivo no es en / es / pt. */
export const DEFAULT_LOCALE: Locale = 'en';

export const COOKIE_NAME = 'kh_locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
