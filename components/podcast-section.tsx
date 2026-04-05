'use client';

import { useEffect, useState, useMemo } from 'react';
import { EpisodeCard, normalizeForSearch } from './episode-card';
import { EpisodeModal } from './episode-modal';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n/locale-provider';
import type { PodcastEpisode } from '@/lib/youtube';

const EPISODES_PER_PAGE = 6;

interface PodcastSectionProps {
  preview?: boolean;
}

export function PodcastSection({ preview = false }: PodcastSectionProps) {
  const { t } = useI18n();
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(
    null
  );
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState<1 | 2 | 'all'>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch('/api/episodes')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          const msg = data?.details
            ? `${data.error}: ${data.details}`
            : data?.error || t('podcast.errorUnavailable');
          throw new Error(msg);
        }
        return data;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setEpisodes(data);
        } else {
          setError(t('podcast.errorUnexpected'));
        }
      })
      .catch((err) =>
        setError(err?.message || t('podcast.errorUnavailable'))
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only; locale change need not refetch YouTube
  }, []);

  const filteredEpisodes = useMemo(() => {
    let result = episodes;

    if (search.trim()) {
      const normalizedSearch = normalizeForSearch(search);
      result = result.filter(
        (ep) =>
          normalizeForSearch(ep.episodeTitle).includes(normalizedSearch) ||
          normalizeForSearch(ep.guest).includes(normalizedSearch) ||
          normalizeForSearch(ep.title).includes(normalizedSearch)
      );
    }

    if (season !== 'all') {
      result = result.filter((ep) => ep.season === season);
    }

    return result;
  }, [episodes, search, season]);

  const totalPages = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);
  const paginatedEpisodes = useMemo(() => {
    const start = (page - 1) * EPISODES_PER_PAGE;
    return filteredEpisodes.slice(start, start + EPISODES_PER_PAGE);
  }, [filteredEpisodes, page]);

  useEffect(() => {
    setPage(1);
  }, [search, season]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full max-w-md rounded-md bg-muted animate-pulse" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const isApiKeyError =
      error.toLowerCase().includes('youtube_api_key') ||
      error.toLowerCase().includes('api key') ||
      error.toLowerCase().includes('not configured');
    const isFetchError =
      error.toLowerCase().includes('failed to fetch') ||
      error.toLowerCase().includes('quota') ||
      error.toLowerCase().includes('forbidden') ||
      error.toLowerCase().includes('invalid');
    return (
      <div className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
        <p className="text-muted-foreground font-medium">{error}</p>
        {(isApiKeyError || isFetchError) && (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>{t('podcast.apiHelpTitle')}</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {t('podcast.apiHelpStep1')}
                </a>
              </li>
              <li>{t('podcast.apiHelpStep2')}</li>
              <li>{t('podcast.apiHelpStep3')}</li>
              <li>
                <code className="bg-muted px-1 rounded">.env.local</code> — {t('podcast.apiHelpStep4')}
              </li>
              <li>{t('podcast.apiHelpStep5')}</li>
            </ol>
            <p className="pt-2">
              {t('podcast.apiHelpListen')}{' '}
              <a href="https://www.youtube.com/@DevLokos/podcasts" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                YouTube
              </a>
              .
            </p>
          </div>
        )}
      </div>
    );
  }

  const displayEpisodes = preview
    ? filteredEpisodes.slice(0, 6)
    : paginatedEpisodes;

  return (
    <div className="space-y-6">
      {/* Filtros - ocultos en preview */}
      {!preview && (
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <input
          type="search"
          placeholder={t('podcast.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="flex gap-2">
          <Button
            variant={season === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSeason('all')}
          >
            {t('podcast.all')}
          </Button>
          <Button
            variant={season === 1 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSeason(1)}
          >
            {t('podcast.season1')}
          </Button>
          <Button
            variant={season === 2 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSeason(2)}
          >
            {t('podcast.season2')}
          </Button>
        </div>
      </div>
      )}

      {/* Grid de episodios */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayEpisodes.map((episode) => (
          <EpisodeCard
            key={episode.videoId}
            episode={episode}
            onClick={() => setSelectedEpisode(episode)}
          />
        ))}
      </div>

      {/* Paginación - oculta en preview */}
      {!preview && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            {t('podcast.prev')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('podcast.pageOf', { page: String(page), total: String(totalPages) })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            {t('podcast.next')}
          </Button>
        </div>
      )}

      <EpisodeModal
        episode={selectedEpisode}
        onClose={() => setSelectedEpisode(null)}
      />
    </div>
  );
}
