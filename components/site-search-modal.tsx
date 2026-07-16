'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/components/i18n/locale-provider'
import { handleHomeHashLinkClick } from '@/lib/section-scroll'
import { normalizeForSearch } from '@/lib/normalize-for-search'
import { Search } from 'lucide-react'
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

export function SiteSearchModal({ open, onClose }: SiteSearchModalProps) {
  const { t } = useI18n()
  const pathname = usePathname()
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

  const hasResults = results.index.length > 0 || results.articles.length > 0

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-4 py-3 text-left">
          <DialogTitle className="sr-only">{t('siteSearch.openLabel')}</DialogTitle>
          <DialogDescription className="sr-only">{t('siteSearch.placeholder')}</DialogDescription>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('siteSearch.placeholder')}
              className="pl-9"
              autoFocus
            />
          </div>
          <p className="pt-2 text-xs text-muted-foreground">{t('siteSearch.shortcutHint')}</p>
        </DialogHeader>

        <div className="max-h-[min(60dvh,420px)] overflow-y-auto p-2">
          {!query.trim() ? null : !hasResults ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t('siteSearch.empty')}</p>
          ) : (
            <div className="space-y-4">
              {results.index.length > 0 ? (
                <div>
                  <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {groupLabel('pages', t)}
                  </p>
                  <ul className="space-y-0.5">
                    {results.index.map((item) => (
                      <li key={item.id}>
                        {item.href.startsWith('http') ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg px-3 py-2 text-left hover:bg-muted"
                            onClick={() => onClose()}
                          >
                            <span className="block text-sm font-medium">{item.title}</span>
                            <span className="block text-xs text-muted-foreground line-clamp-1">{item.description}</span>
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            className="block rounded-lg px-3 py-2 text-left hover:bg-muted"
                            onClick={(e) => {
                              handleHomeHashLinkClick(e, pathname, item.href)
                              onClose()
                            }}
                          >
                            <span className="block text-sm font-medium">{item.title}</span>
                            <span className="block text-xs text-muted-foreground line-clamp-1">{item.description}</span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {results.articles.length > 0 ? (
                <div>
                  <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {groupLabel('articles', t)}
                  </p>
                  <ul className="space-y-0.5">
                    {results.articles.map((item) => (
                      <li key={item.link}>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg px-3 py-2 text-left hover:bg-muted"
                          onClick={() => onClose()}
                        >
                          <span className="block text-sm font-medium">{item.title}</span>
                          <span className="block text-xs text-muted-foreground line-clamp-1">{item.excerpt}</span>
                        </a>
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
