'use client';

import Image from 'next/image';
import { useI18n } from '@/components/i18n/locale-provider';
import { Badge } from '@/components/ui/badge';
import { CONFERENCE_BADGE_OVERLAY_CLASS } from '@/lib/conference-ui';
import { toBcp47 } from '@/lib/i18n/bcp47';
import { cn } from '@/lib/utils';
import type { PodcastEpisode } from '@/lib/youtube';

interface EpisodeCardProps {
  episode: PodcastEpisode;
  onClick: () => void;
}

export function EpisodeCard({ episode, onClick }: EpisodeCardProps) {
  const { t, locale } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border bg-card text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <div className="relative aspect-[4/3] shrink-0 sm:aspect-video">
        <Image
          src={episode.thumbnail}
          alt={episode.episodeTitle}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
        {episode.duration ? (
          <Badge
            className={cn(
              CONFERENCE_BADGE_OVERLAY_CLASS,
              'pointer-events-none absolute bottom-1.5 right-1.5 z-[1] rounded-full border-0 px-1.5 py-0.5 text-[9px] font-normal leading-tight shadow-sm sm:bottom-2 sm:right-2 sm:px-2.5 sm:py-1 sm:text-xs'
            )}
          >
            {episode.duration}
          </Badge>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col space-y-0.5 p-2 sm:space-y-1 sm:p-3 md:p-4">
        <h3 className="line-clamp-2 text-[11px] font-semibold leading-snug group-hover:text-primary sm:text-sm">
          {episode.episodeTitle}
        </h3>
        {episode.guest && (
          <p className="hidden text-sm text-muted-foreground sm:block">{t('podcast.withGuest', { guest: episode.guest })}</p>
        )}
        {episode.description && (
          <p className="hidden text-sm text-muted-foreground line-clamp-2 sm:block">
            {episode.description.slice(0, 120)}...
          </p>
        )}
        <p className="mt-auto pt-1 text-[10px] text-muted-foreground sm:pt-0 sm:text-xs">
          {new Date(episode.publishDate).toLocaleDateString(toBcp47(locale), {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </button>
  );
}
