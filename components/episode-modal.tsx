'use client';

import { useEffect } from 'react';
import { useI18n } from '@/components/i18n/locale-provider';
import type { PodcastEpisode } from '@/lib/youtube';

interface EpisodeModalProps {
  episode: PodcastEpisode | null;
  onClose: () => void;
}

export function EpisodeModal({ episode, onClose }: EpisodeModalProps) {
  const { t } = useI18n();
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    if (episode) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [episode, onClose]);

  if (!episode) return null;

  const embedUrl = `https://www.youtube.com/embed/${episode.videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-4xl rounded-lg overflow-hidden bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          aria-label={t('common.close')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={episode.episodeTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="p-4">
          <h2 id="modal-title" className="font-semibold text-lg">
            {episode.episodeTitle}
          </h2>
          {episode.guest && (
            <p className="text-muted-foreground text-sm mt-1">
              Con {episode.guest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
