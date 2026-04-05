import type { Locale } from './config';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import pt from '@/messages/pt.json';

export const messageBundles: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  es: es as Record<string, unknown>,
  pt: pt as Record<string, unknown>,
};

export function lookupString(
  bundle: Record<string, unknown>,
  path: string
): string | undefined {
  const parts = path.split('.');
  let current: unknown = bundle;
  for (const p of parts) {
    if (current && typeof current === 'object' && p in current) {
      current = (current as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}
