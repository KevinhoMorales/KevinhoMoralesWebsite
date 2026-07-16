'use client'

import { useLayoutEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EpisodeCard } from '@/components/episode-card'
import { preloadAdjacentPodcastPages } from '@/lib/preload-podcast-thumbnails'
import type { PodcastEpisode } from '@/lib/youtube'

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0.85,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0.85,
  }),
}

interface PodcastEpisodesPagerProps {
  episodes: PodcastEpisode[]
  page: number
  direction: number
  perPage: number
  onSelectEpisode: (episode: PodcastEpisode) => void
}

function EpisodeGridPlaceholder() {
  return (
    <div
      className="pointer-events-none invisible rounded-lg border border-transparent bg-card overflow-hidden"
      aria-hidden
    >
      <div className="relative aspect-video" />
      <div className="space-y-1 p-4">
        <div className="h-10" />
        <div className="h-4 w-2/3" />
        <div className="h-3 w-1/3" />
        <div className="mt-2 h-8" />
      </div>
    </div>
  )
}

export function PodcastEpisodesPager({
  episodes,
  page,
  direction,
  perPage,
  onSelectEpisode,
}: PodcastEpisodesPagerProps) {
  const totalPages = Math.max(1, Math.ceil(episodes.length / perPage))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * perPage
  const pageEpisodes = episodes.slice(start, start + perPage)
  const isOnlyPartialPage =
    episodes.length > 0 && episodes.length <= perPage && pageEpisodes.length < perPage
  const slotCount = isOnlyPartialPage ? pageEpisodes.length : perPage

  useLayoutEffect(() => {
    preloadAdjacentPodcastPages(episodes, start, perPage)
  }, [episodes, start, perPage])

  return (
    <div className="relative w-full overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.div
          key={safePage}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6"
        >
          {Array.from({ length: slotCount }, (_, index) => {
            const episode = pageEpisodes[index]
            if (episode) {
              return (
                <EpisodeCard
                  key={episode.videoId}
                  episode={episode}
                  onClick={() => onSelectEpisode(episode)}
                />
              )
            }

            return <EpisodeGridPlaceholder key={`placeholder-${safePage}-${index}`} />
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
