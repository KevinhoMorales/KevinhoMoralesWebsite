'use client';

import { useI18n } from '@/components/i18n/locale-provider';

export default function Loading() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
    </div>
  );
}
