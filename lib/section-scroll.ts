import type { MouseEvent } from 'react'

export function prefersSmoothScroll(): boolean {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function scrollToSectionById(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({
    behavior: prefersSmoothScroll() ? 'smooth' : 'auto',
    block: 'start',
  })
}

/** `href` must be like `/about` → only intercepts `/#…` home section links. */
export function handleHomeHashLinkClick(
  e: MouseEvent<HTMLAnchorElement>,
  pathname: string | null,
  href: string
): void {
  if (pathname !== '/' || !href.startsWith('/#') || href.length < 3) return
  e.preventDefault()
  const id = decodeURIComponent(href.slice(2))
  scrollToSectionById(id)
  window.history.replaceState(null, '', href)
}
