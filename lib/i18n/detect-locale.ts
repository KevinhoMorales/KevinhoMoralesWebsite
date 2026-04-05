import { DEFAULT_LOCALE, type Locale } from './config';

/** Mapea la etiqueta primaria (p. ej. `es`, `pt`, `en`) a nuestro locale. */
function mapTagToLocale(primary: string): Locale | null {
  const p = primary.toLowerCase();
  if (p === 'es') return 'es';
  if (p === 'pt') return 'pt';
  if (p === 'en') return 'en';
  return null;
}

/**
 * Elige locale a partir del header `Accept-Language` (navegador / sistema).
 * Respeta orden y pesos `q=`. Si ningún idioma coincide con en/es/pt → `DEFAULT_LOCALE` (inglés).
 */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header?.trim()) return DEFAULT_LOCALE;

  const candidates: { base: string; q: number }[] = [];

  for (const segment of header.split(',')) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const [langPart, ...rest] = trimmed.split(';');
    const tag = langPart.trim().toLowerCase();
    if (!tag || tag === '*') continue;

    let q = 1;
    for (const param of rest) {
      const [k, v] = param.trim().split('=').map((s) => s.trim());
      if (k === 'q' && v) {
        const parsed = parseFloat(v);
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }
    const base = tag.split('-')[0];
    if (base) candidates.push({ base, q });
  }

  candidates.sort((a, b) => b.q - a.q);

  for (const { base } of candidates) {
    const mapped = mapTagToLocale(base);
    if (mapped) return mapped;
  }

  return DEFAULT_LOCALE;
}
