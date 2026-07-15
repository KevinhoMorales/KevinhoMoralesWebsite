'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { BrowseListModal } from '@/components/ui/browse-list-modal'
import { useI18n } from '@/components/i18n/locale-provider'
import { toBcp47 } from '@/lib/i18n/bcp47'
import { normalizeForSearch } from '@/lib/normalize-for-search'
import { FileText } from 'lucide-react'

const LIST_LIMIT = 50

interface Article {
  title: string
  link: string
  publishDate: string
  excerpt: string
  image?: string
}

interface ArticlesModalProps {
  open: boolean
  onClose: () => void
}

export function ArticlesModal({ open, onClose }: ArticlesModalProps) {
  const { t, locale } = useI18n()
  const [search, setSearch] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    if (!open) {
      setSearch('')
      return
    }

    setLoading(true)
    setLoadFailed(false)
    fetch(`/api/articles?limit=${LIST_LIMIT}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error('Bad shape')
        setArticles(data as Article[])
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false))
  }, [open])

  const filteredArticles = useMemo(() => {
    const q = normalizeForSearch(search.trim())
    if (!q) return articles

    return articles.filter((article) => {
      const haystack = normalizeForSearch([article.title, article.excerpt].join(' '))
      return haystack.includes(q)
    })
  }, [articles, search])

  return (
    <BrowseListModal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={t('articlesModal.title')}
      searchPlaceholder={t('articlesModal.searchPlaceholder')}
      searchValue={search}
      onSearchChange={setSearch}
      emptyMessage={
        loadFailed
          ? t('articles.unavailable')
          : loading
            ? undefined
            : search.trim()
              ? t('browseModal.noResults')
              : t('articles.unavailable')
      }
      isEmpty={!loading && (loadFailed || filteredArticles.length === 0)}
    >
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {filteredArticles.map((article) => (
            <Card
              key={article.link}
              className="bg-card/50 border-border/50 overflow-hidden group hover:border-primary/50 transition-colors"
            >
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="aspect-video bg-secondary relative overflow-hidden">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{article.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(article.publishDate).toLocaleDateString(toBcp47(locale))}
                  </p>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      )}
    </BrowseListModal>
  )
}
