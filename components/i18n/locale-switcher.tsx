'use client';

import { LOCALES, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

import { useI18n } from './locale-provider';

const LABELS: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  pt: 'PT',
};

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className="flex items-center rounded-full border border-border/60 bg-secondary/30 p-0.5"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={cn(
            'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors sm:px-2.5 sm:text-xs',
            locale === code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
