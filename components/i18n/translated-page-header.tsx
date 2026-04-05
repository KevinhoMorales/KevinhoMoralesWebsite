'use client';

import { useI18n } from './locale-provider';

export function TranslatedPageHeader({
  titleKey,
  descKey,
}: {
  titleKey: string;
  descKey: string;
}) {
  const { t } = useI18n();
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">{t(titleKey)}</h1>
      <p className="text-muted-foreground mb-8">{t(descKey)}</p>
    </>
  );
}
