'use client'

import { useLayoutEffect, useRef, useState } from 'react'
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

export function PodcastEpisodesPager({
  episodes,
  page,
  direction,
  perPage,
  onSelectEpisode,
}: PodcastEpisodesPagerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const maxHeightRef = useRef(0)
  const [height, setHeight] = useState<number | undefined>(undefined)

  const totalPages = Math.max(1, Math.ceil(episodes.length / perPage))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * perPage
  const pageEpisodes = episodes.slice(start, start + perPage)

  useLayoutEffect(() => {
    preloadAdjacentPodcastPages(episodes, start, perPage)
  }, [episodes, start, perPage])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const grids = el.querySelectorAll<HTMLElement>('[data-active-page-grid]')
      let max = 0
      grids.forEach((grid) => {
        max = Math.max(max, grid.offsetHeight)
      })
      if (max > 0) {
        maxHeightRef.current = Math.max(maxHeightRef.current, max)
        setHeight(maxHeightRef.current)
      }
    }

    measure()
    const raf = requestAnimationFrame(measure)

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [safePage, pageEpisodes.length, episodes.length])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={height ? { minHeight: height } : undefined}
    >
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
          data-active-page-grid
        >
          {pageEpisodes.map((episode) => (
            <EpisodeCard
              key={episode.videoId}
              episode={episode}
              onClick={() => onSelectEpisode(episode)}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
