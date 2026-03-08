'use client';

import Image from 'next/image';
import type { PodcastEpisode } from '@/lib/youtube';

interface EpisodeCardProps {
  episode: PodcastEpisode;
  onClick: () => void;
}

function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function EpisodeCard({ episode, onClick }: EpisodeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <div className="relative aspect-video">
        <Image
          src={episode.thumbnail}
          alt={episode.episodeTitle}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
        {episode.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
            {episode.duration}
          </span>
        )}
      </div>
      <div className="p-4 space-y-1">
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary">
          {episode.episodeTitle}
        </h3>
        {episode.guest && (
          <p className="text-sm text-muted-foreground">Con {episode.guest}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {new Date(episode.publishDate).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        {episode.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {episode.description.slice(0, 120)}...
          </p>
        )}
      </div>
    </button>
  );
}

export { normalizeForSearch };
