'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PodcastEpisodesPager } from './podcast-episodes-pager';
import { EpisodeCard } from './episode-card';
import { normalizeForSearch } from '@/lib/normalize-for-search';
import { preloadPodcastThumbnails } from '@/lib/preload-podcast-thumbnails';
import { EpisodeModal } from './episode-modal';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n/locale-provider';
import { MOTION_EASE } from '@/lib/motion';
import { Headphones, SearchX } from 'lucide-react';
import type { PodcastEpisode } from '@/lib/youtube';

const EPISODES_PER_PAGE_DESKTOP = 6;
const EPISODES_PER_PAGE_MOBILE = 4;
/** Episodios en la home (preview); menos tarjetas en móvil sin scroll horizontal */
const HOME_PREVIEW_EPISODES = 3;

/** Altura estable del listado para que la foto lateral no salte al buscar o paginar. */
const EPISODES_PANEL_CLASS =
  'relative flex min-h-[24rem] flex-col sm:min-h-[30rem] lg:min-h-[34rem]';

const PAGINATION_SLOT_CLASS =
  'flex h-10 shrink-0 items-center justify-center gap-2 pt-4';

interface PodcastSectionProps {
  preview?: boolean;
}

function PodcastEmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/30 px-4 py-8 text-center sm:px-6 sm:py-12">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/80">
        <SearchX className="h-7 w-7 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-base font-semibold text-foreground">
        {hasFilters ? t('podcast.emptyFilteredTitle') : t('podcast.emptyTitle')}
      </p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters ? t('podcast.emptyFilteredHint') : t('podcast.emptyHint')}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {hasFilters ? (
          <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
            {t('podcast.clearFilters')}
          </Button>
        ) : null}
        <Button type="button" size="sm" className="gap-1.5" asChild>
          <a
            href="https://www.youtube.com/@DevLokos/podcasts"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Headphones className="h-4 w-4" aria-hidden />
            {t('podcastUi.listenYoutube')}
          </a>
        </Button>
      </div>
    </div>
  );
}

export function PodcastSection({ preview = false }: PodcastSectionProps) {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion() ?? false;
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(
    null
  );
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState<1 | 2 | 'all'>('all');
  const [page, setPage] = useState(1);
  const [slideDirection, setSlideDirection] = useState(0);
  const [episodesPerPage, setEpisodesPerPage] = useState(EPISODES_PER_PAGE_DESKTOP);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () =>
      setEpisodesPerPage(mq.matches ? EPISODES_PER_PAGE_MOBILE : EPISODES_PER_PAGE_DESKTOP);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

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
          // Precarga las 2 primeras páginas antes del primer cambio de página
          preloadPodcastThumbnails(data.slice(0, EPISODES_PER_PAGE_DESKTOP * 2));
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

  const totalPages = Math.ceil(filteredEpisodes.length / episodesPerPage);

  useEffect(() => {
    setPage(1);
    setSlideDirection(0);
  }, [search, season]);

  const goToPage = useCallback(
    (next: number) => {
      setSlideDirection(next > page ? 1 : -1);
      setPage(next);
    },
    [page]
  );

  const clearFilters = useCallback(() => {
    setSearch('');
    setSeason('all');
  }, []);

  const hasActiveFilters = Boolean(search.trim()) || season !== 'all';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full max-w-md rounded-md bg-muted animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {Array.from({ length: HOME_PREVIEW_EPISODES }).map((_, i) => (
            <div key={i} className="aspect-video rounded-lg bg-muted animate-pulse" />
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
    ? filteredEpisodes.slice(0, HOME_PREVIEW_EPISODES)
    : [];

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Filtros - ocultos en preview */}
      {!preview && (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <input
          type="search"
          placeholder={t('podcast.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-8 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-9 sm:text-sm"
        />
        <div className="flex flex-wrap gap-2">
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

      {!preview ? (
        <div className={EPISODES_PANEL_CLASS}>
          <div className="flex min-h-0 flex-1 flex-col">
            <AnimatePresence mode="wait" initial={false}>
              {filteredEpisodes.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={reducedMotion ? false : { opacity: 1, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 1, y: -8 }}
                  transition={
                    reducedMotion ? { duration: 0 } : { duration: 0.3, ease: MOTION_EASE }
                  }
                  className="flex min-h-0 flex-1"
                >
                  <PodcastEmptyState hasFilters={hasActiveFilters} onClearFilters={clearFilters} />
                </motion.div>
              ) : (
                <motion.div
                  key="episodes"
                  initial={reducedMotion ? false : { opacity: 1, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 1, y: -8 }}
                  transition={
                    reducedMotion ? { duration: 0 } : { duration: 0.3, ease: MOTION_EASE }
                  }
                  className="min-h-0 flex-1"
                >
                  <PodcastEpisodesPager
                    episodes={filteredEpisodes}
                    page={page}
                    direction={slideDirection}
                    perPage={episodesPerPage}
                    onSelectEpisode={setSelectedEpisode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={PAGINATION_SLOT_CLASS}>
            {filteredEpisodes.length > 0 && totalPages > 1 ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(Math.max(1, page - 1))}
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
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                >
                  {t('podcast.next')}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6">
          {displayEpisodes.map((episode) => (
            <EpisodeCard
              key={episode.videoId}
              episode={episode}
              onClick={() => setSelectedEpisode(episode)}
            />
          ))}
        </div>
      )}

      <EpisodeModal
        episode={selectedEpisode}
        onClose={() => setSelectedEpisode(null)}
      />
    </div>
  );
}
