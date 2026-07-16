'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/components/i18n/locale-provider'
import { handleHomeHashLinkClick } from '@/lib/section-scroll'
import { normalizeForSearch } from '@/lib/normalize-for-search'
import { cn } from '@/lib/utils'
import { ArrowRight, Search, X } from 'lucide-react'
import type { SearchIndexItem } from '@/app/api/search-index/route'

type ArticleHit = {
  title: string
  link: string
  excerpt: string
}

type SiteSearchModalProps = {
  open: boolean
  onClose: () => void
}

function groupLabel(group: SearchIndexItem['group'] | 'articles', t: (key: string) => string): string {
  const map = {
    projects: 'siteSearch.groupProjects',
    experience: 'siteSearch.groupExperience',
    articles: 'siteSearch.groupArticles',
    pages: 'siteSearch.groupPages',
  } as const
  return t(map[group])
}

function ResultLink({
  href,
  title,
  description,
  external,
  onNavigate,
}: {
  href: string
  title: string
  description: string
  external?: boolean
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const className =
    'group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-primary/10'

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug group-hover/item:text-primary">{title}</span>
        <span className="mt-0.5 block line-clamp-1 text-xs text-muted-foreground">{description}</span>
      </div>
      <ArrowRight
        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-primary"
        aria-hidden
      />
    </>
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        handleHomeHashLinkClick(e, pathname, href)
        onNavigate()
      }}
    >
      {content}
    </Link>
  )
}

export function SiteSearchModal({ open, onClose }: SiteSearchModalProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [indexItems, setIndexItems] = useState<SearchIndexItem[]>([])
  const [articles, setArticles] = useState<ArticleHit[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!open || loaded) return
    Promise.all([
      fetch('/api/search-index').then((r) => (r.ok ? r.json() : { items: [] })),
      fetch('/api/articles?limit=30').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([indexData, articleData]) => {
        setIndexItems(Array.isArray(indexData.items) ? indexData.items : [])
        setArticles(Array.isArray(articleData) ? articleData : [])
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [open, loaded])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const results = useMemo(() => {
    const q = normalizeForSearch(query.trim())
    if (!q) return { index: [] as SearchIndexItem[], articles: [] as ArticleHit[] }

    const index = indexItems.filter((item) => {
      const hay = normalizeForSearch(`${item.title} ${item.description}`)
      return hay.includes(q)
    })

    const articleHits = articles.filter((item) => {
      const hay = normalizeForSearch(`${item.title} ${item.excerpt}`)
      return hay.includes(q)
    })

    return { index: index.slice(0, 12), articles: articleHits.slice(0, 6) }
  }, [query, indexItems, articles])

  const groupedIndex = useMemo(() => {
    const groups: Record<SearchIndexItem['group'], SearchIndexItem[]> = {
      pages: [],
      projects: [],
      experience: [],
    }
    for (const item of results.index) {
      groups[item.group].push(item)
    }
    return groups
  }, [results.index])

  const hasResults = results.index.length > 0 || results.articles.length > 0
  const trimmedQuery = query.trim()

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[min(100%-2rem,34rem)] [&>div>button.absolute]:hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          aria-hidden
        />

        <DialogTitle className="sr-only">{t('siteSearch.openLabel')}</DialogTitle>
        <DialogDescription className="sr-only">{t('siteSearch.placeholder')}</DialogDescription>

        <div className="border-b border-border/50 px-4 py-4 sm:px-5 sm:py-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-primary/80"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('siteSearch.placeholder')}
              autoFocus
              className={cn(
                'flex h-12 w-full rounded-xl border border-input/80 bg-background/70 pl-10 pr-10 text-base shadow-sm',
                'transition-[border-color,box-shadow,background-color]',
                'placeholder:text-muted-foreground/80',
                'focus-visible:border-primary/45 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/15'
              )}
            />
            <button
              type="button"
              onClick={() => (trimmedQuery ? setQuery('') : onClose())}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={trimmedQuery ? t('podcast.clearFilters') : t('common.close')}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>{t('siteSearch.shortcutHint')}</span>
            <kbd className="hidden rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground/80 sm:inline">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="min-h-[11rem] max-h-[min(50dvh,380px)] overflow-y-auto px-2 py-3 sm:px-3 sm:py-4">
          {!trimmedQuery ? (
            <div className="flex h-full min-h-[9rem] flex-col items-center justify-center px-4 py-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Search className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-sm font-medium text-foreground">{t('siteSearch.idleTitle')}</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                {t('siteSearch.idleHint')}
              </p>
            </div>
          ) : !hasResults ? (
            <div className="flex min-h-[9rem] flex-col items-center justify-center px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">{t('siteSearch.empty')}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('siteSearch.emptyHint')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(['pages', 'projects', 'experience'] as const).map((group) =>
                groupedIndex[group].length > 0 ? (
                  <div key={group}>
                    <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {groupLabel(group, t)}
                    </p>
                    <ul className="space-y-0.5">
                      {groupedIndex[group].map((item) => (
                        <li key={item.id}>
                          <ResultLink
                            href={item.href}
                            title={item.title}
                            description={item.description}
                            external={item.href.startsWith('http')}
                            onNavigate={onClose}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}

              {results.articles.length > 0 ? (
                <div>
                  <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {groupLabel('articles', t)}
                  </p>
                  <ul className="space-y-0.5">
                    {results.articles.map((item) => (
                      <li key={item.link}>
                        <ResultLink
                          href={item.link}
                          title={item.title}
                          description={item.excerpt}
                          external
                          onNavigate={onClose}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function useSiteSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpen()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onOpen])
}

export function SiteSearchTrigger() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const openSearch = useCallback(() => setOpen(true), [])
  useSiteSearchShortcut(openSearch)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t('siteSearch.openLabel')}
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>
      <SiteSearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
