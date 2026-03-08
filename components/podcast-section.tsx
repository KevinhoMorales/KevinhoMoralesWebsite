'use client';

import { useEffect, useState, useMemo } from 'react';
import { EpisodeCard, normalizeForSearch } from './episode-card';
import { EpisodeModal } from './episode-modal';
import { Button } from '@/components/ui/button';
import type { PodcastEpisode } from '@/lib/youtube';

const EPISODES_PER_PAGE = 6;

interface PodcastSectionProps {
  preview?: boolean;
}

export function PodcastSection({ preview = false }: PodcastSectionProps) {
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
            : data?.error || 'Error al cargar episodios';
          throw new Error(msg);
        }
        return data;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setEpisodes(data);
        } else {
          setError('Formato de respuesta inesperado');
        }
      })
      .catch((err) =>
        setError(
          err?.message ||
            'Episodios no disponibles. Agrega YOUTUBE_API_KEY a .env.local'
        )
      )
      .finally(() => setLoading(false));
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
            <p>Para cargar los episodios del podcast desde YouTube:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Ve a <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
              <li>En &quot;APIs &amp; Services&quot; → &quot;Library&quot;, busca y activa <strong>YouTube Data API v3</strong></li>
              <li>Crea una API key en &quot;Credentials&quot; → &quot;Create Credentials&quot; → &quot;API key&quot;</li>
              <li>En <code className="bg-muted px-1 rounded">.env.local</code> agrega: <code className="bg-muted px-1 rounded">YOUTUBE_API_KEY=tu_api_key_real</code></li>
              <li>Reinicia el servidor (<code className="bg-muted px-1 rounded">npm run dev</code>)</li>
            </ol>
            <p className="pt-2">
              Mientras tanto, puedes escuchar en{' '}
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
          placeholder="Search by title or guest..."
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
            All
          </Button>
          <Button
            variant={season === 1 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSeason(1)}
          >
            Season 1
          </Button>
          <Button
            variant={season === 2 ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSeason(2)}
          >
            Season 2
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
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
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
