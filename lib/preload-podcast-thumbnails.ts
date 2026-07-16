import type { PodcastEpisode } from '@/lib/youtube';

const preloaded = new Set<string>();

/** Precarga thumbnails en caché del navegador (idempotente por videoId). */
export function preloadPodcastThumbnails(episodes: PodcastEpisode[]): void {
  if (typeof window === 'undefined') return;

  episodes.forEach((episode) => {
    if (!episode.thumbnail || preloaded.has(episode.videoId)) return;
    preloaded.add(episode.videoId);
    const img = new window.Image();
    img.decoding = 'async';
    img.src = episode.thumbnail;
  });
}

/** Precarga las páginas adyacentes (actual ±1) para paginación fluida. */
export function preloadAdjacentPodcastPages(
  episodes: PodcastEpisode[],
  start: number,
  perPage: number
): void {
  const offsets = [start, start + perPage, start - perPage].filter(
    (s) => s >= 0 && s < episodes.length
  );
  const batch: PodcastEpisode[] = [];
  const seen = new Set<string>();
  offsets.forEach((offset) => {
    episodes.slice(offset, offset + perPage).forEach((ep) => {
      if (!seen.has(ep.videoId)) {
        seen.add(ep.videoId);
        batch.push(ep);
      }
    });
  });
  preloadPodcastThumbnails(batch);
}
