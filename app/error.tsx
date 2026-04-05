'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n/locale-provider';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">{t('errorPage.title')}</h1>
      <p className="text-sm text-muted-foreground">
        {error.message || t('errorPage.fallback')}
      </p>
      <Button type="button" onClick={() => reset()}>
        {t('errorPage.retry')}
      </Button>
    </div>
  );
}
