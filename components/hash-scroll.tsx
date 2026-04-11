'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { scheduleScrollToSectionById, scrollToSectionById } from '@/lib/section-scroll'

/**
 * After loading `/` with a hash (or client navigation to `/#…`), scroll to the section.
 * Retries if the target mounts late; runs an extra pass after layout (images/fonts) so position stays correct.
 */
export function HashScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/') return

    let cancelSchedule: (() => void) | undefined
    const refinementTimeouts: number[] = []

    const applyHash = () => {
      cancelSchedule?.()
      refinementTimeouts.forEach((t) => clearTimeout(t))
      refinementTimeouts.length = 0

      const hash = window.location.hash
      if (!hash || hash.length < 2) return
      const id = decodeURIComponent(hash.slice(1))

      const go = () => scrollToSectionById(id, { behavior: 'auto' })

      requestAnimationFrame(() => {
        requestAnimationFrame(go)
      })

      refinementTimeouts.push(
        window.setTimeout(go, 150),
        window.setTimeout(go, 400)
      )

      cancelSchedule = scheduleScrollToSectionById(id, { behavior: 'auto' })
    }

    applyHash()
    window.addEventListener('hashchange', applyHash)

    const onLoad = () => applyHash()
    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad)
    }

    return () => {
      window.removeEventListener('hashchange', applyHash)
      window.removeEventListener('load', onLoad)
      refinementTimeouts.forEach((t) => clearTimeout(t))
      cancelSchedule?.()
    }
  }, [pathname])

  return null
}
