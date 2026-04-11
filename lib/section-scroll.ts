import type { MouseEvent } from 'react'

export function prefersSmoothScroll(): boolean {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Offset below fixed nav; prefer `scroll-padding-top` on `html` (see `globals.css`). */
function getHashScrollOffsetPx(): number {
  if (typeof document === 'undefined') return 80
  const raw = getComputedStyle(document.documentElement).scrollPaddingTop
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) && n > 0 ? n : 80
}

/**
 * Scroll so the section’s top sits just under the fixed header.
 * Uses `window.scrollTo` + geometry instead of `scrollIntoView`, which stacks badly with
 * both `scroll-padding-top` (html) and `scroll-margin` (sections) in some browsers — e.g. `#conferences`
 * landing one section too high (podcast).
 */
export function scrollToSectionById(
  id: string,
  options?: { behavior?: ScrollBehavior }
): boolean {
  const el = document.getElementById(id)
  if (!el) return false

  const offset = getHashScrollOffsetPx()
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  const behavior = options?.behavior ?? (prefersSmoothScroll() ? 'smooth' : 'auto')

  window.scrollTo({
    top: Math.max(0, top),
    behavior,
  })
  return true
}

/**
 * Retry scrolling for late-hydrating client islands or layout after images/fonts.
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
