import type { Locale } from './config';

/** For `toLocaleDateString` / formatting. */
export function toBcp47(locale: Locale): string {
  switch (locale) {
    case 'en':
      return 'en-US';
    case 'es':
      return 'es';
    case 'pt':
      return 'pt-BR';
    default:
      return 'en-US';
  }
}
