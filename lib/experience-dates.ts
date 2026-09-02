import type { Locale } from '@/lib/i18n/config'

const LOCALE_TAG: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-EC',
  pt: 'pt-BR',
}

/** Formatea YYYY-MM o YYYY-MM-DD para la UI de Experience. */
export function formatExperienceDate(raw: string | undefined, locale: Locale): string | null {
  const value = raw?.trim()
  if (!value) return null

  const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymd) {
    const date = new Date(Date.UTC(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3])))
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date)
  }

  const ym = value.match(/^(\d{4})-(\d{2})$/)
  if (ym) {
    const date = new Date(Date.UTC(Number(ym[1]), Number(ym[2]) - 1, 1))
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date)
  }

  return value
}
