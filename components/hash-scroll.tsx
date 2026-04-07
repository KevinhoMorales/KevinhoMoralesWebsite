'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { scrollToSectionById } from '@/lib/section-scroll'

/**
 * After client navigation to `/` with a hash (e.g. from another route), scroll to the section.
 * In-page clicks use `handleHomeHashLinkClick` on nav links for reliable smooth scroll.
 */
export function HashScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/') return

    const applyHash = () => {
      const hash = window.location.hash
      if (!hash || hash.length < 2) return
      const id = decodeURIComponent(hash.slice(1))
      requestAnimationFrame(() => scrollToSectionById(id))
    }

    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [pathname])

  return null
}
