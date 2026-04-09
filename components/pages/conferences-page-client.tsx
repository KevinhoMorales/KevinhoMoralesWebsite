'use client';

import Link from 'next/link';
import { TranslatedPageHeader } from '@/components/i18n/translated-page-header';
import { useI18n } from '@/components/i18n/locale-provider';
import type { Conference } from '@/types';
import { hasWatchableVideoUrl } from '@/lib/conference-video-url';

export function ConferencesPageClient({ conferences }: { conferences: Conference[] }) {
  const { t } = useI18n();

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <TranslatedPageHeader titleKey="pages.conferences.title" descKey="pages.conferences.desc" />
      <div className="space-y-4">
        {conferences.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('pages.conferences.empty')}</p>
        ) : null}
        {conferences.map((conf) => (
          <article
            key={conf.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border"
          >
            <div className="flex-1">
              <h3 className="font-semibold">{conf.title}</h3>
              {conf.topic && (
                <p className="text-sm text-muted-foreground mt-1">{conf.topic}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs rounded bg-muted px-2 py-0.5">{conf.type}</span>
                {conf.tags?.map((tag) => (
                  <span key={tag} className="text-xs rounded bg-muted px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {hasWatchableVideoUrl(conf.videoUrl) && (
              <Link
                href={conf.videoUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline shrink-0"
              >
                {t('common.watchArrow')}
              </Link>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
