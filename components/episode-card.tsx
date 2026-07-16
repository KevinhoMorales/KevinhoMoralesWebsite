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
      className="group w-full text-left rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <div className="relative aspect-[4/3] sm:aspect-video">
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
              'pointer-events-none absolute bottom-2 right-2 z-[1] rounded-full border-0 px-2.5 py-1 text-[0.7rem] font-normal leading-tight shadow-sm sm:text-xs'
            )}
          >
            {episode.duration}
          </Badge>
        ) : null}
      </div>
      <div className="space-y-0.5 p-2.5 sm:space-y-1 sm:p-3 md:p-4">
        <h3 className="line-clamp-2 text-xs font-semibold group-hover:text-primary sm:text-sm">
          {episode.episodeTitle}
        </h3>
        {episode.guest && (
          <p className="hidden text-sm text-muted-foreground sm:block">{t('podcast.withGuest', { guest: episode.guest })}</p>
        )}
        <p className="text-[10px] text-muted-foreground sm:text-xs">
          {new Date(episode.publishDate).toLocaleDateString(toBcp47(locale), {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        {episode.description && (
          <p className="hidden text-sm text-muted-foreground line-clamp-2 mt-2 sm:block">
            {episode.description.slice(0, 120)}...
          </p>
        )}
      </div>
    </button>
  );
}
