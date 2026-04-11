'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { scheduleScrollToSectionById } from '@/lib/section-scroll'

/**
 * After loading `/` with a hash (or client navigation to `/#…`), scroll to the section.
 * Retries briefly so client components that hydrate after first paint still resolve.
 */
export function HashScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/') return

    let cancelSchedule: (() => void) | undefined

    const applyHash = () => {
      cancelSchedule?.()
      const hash = window.location.hash
      if (!hash || hash.length < 2) return
      const id = decodeURIComponent(hash.slice(1))
      cancelSchedule = scheduleScrollToSectionById(id, { behavior: 'auto' })
    }

    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => {
      window.removeEventListener('hashchange', applyHash)
      cancelSchedule?.()
    }
  }, [pathname])

  return null
}
