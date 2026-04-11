import type { MouseEvent } from 'react'

export function prefersSmoothScroll(): boolean {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Scroll to a section by id. Returns whether the element was found.
 * Prefer `scroll-margin` / `scroll-padding` on sections so the fixed nav does not cover titles.
 */
export function scrollToSectionById(
  id: string,
  options?: { behavior?: ScrollBehavior }
): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  const behavior =
    options?.behavior ?? (prefersSmoothScroll() ? 'smooth' : 'auto')
  el.scrollIntoView({ behavior, block: 'start' })
  return true
}

/**
 * Retry scrolling for late-hydrating client islands or slow first paint (e.g. opening `/#conferences`).
 * Uses `auto` by default to avoid fighting the browser’s initial fragment scroll.
 */
export function scheduleScrollToSectionById(
  id: string,
  options?: { behavior?: ScrollBehavior }
): () => void {
  let cancelled = false
  let tid: number | null = null
  let n = 0

  const behavior = options?.behavior ?? 'auto'

  const run = () => {
    if (cancelled) return
    if (scrollToSectionById(id, { behavior })) return
    if (n >= 20) return
    const delay = n === 0 ? 0 : Math.min(32 * n, 400)
    n += 1
    tid = window.setTimeout(run, delay)
  }

  requestAnimationFrame(run)

  return () => {
    cancelled = true
    if (tid !== null) clearTimeout(tid)
  }
}

/** `href` must be like `/#section` → only intercepts `/#…` home section links. */
export function handleHomeHashLinkClick(
  e: MouseEvent<HTMLAnchorElement>,
  pathname: string | null,
  href: string
): void {
  if (pathname !== '/' || !href.startsWith('/#') || href.length < 3) return
  e.preventDefault()
  const id = decodeURIComponent(href.slice(2))
  const behavior = prefersSmoothScroll() ? 'smooth' : 'auto'
  if (!scrollToSectionById(id, { behavior })) {
    const cancel = scheduleScrollToSectionById(id, { behavior })
    window.setTimeout(cancel, 4000)
  }
  window.history.replaceState(null, '', href)
}
