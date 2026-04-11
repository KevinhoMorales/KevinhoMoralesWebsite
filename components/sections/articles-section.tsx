'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/scroll-reveal'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/i18n/locale-provider'
import { toBcp47 } from '@/lib/i18n/bcp47'
import { ArrowRight, ExternalLink, FileText } from 'lucide-react'

/** Request one extra item to know if the RSS feed has more than we show on the home. */
const HOME_ARTICLES = 4
const FETCH_LIMIT = HOME_ARTICLES + 1

interface Article {
  title: string
  link: string
  publishDate: string
  excerpt: string
  image?: string
}

export function ArticlesSection() {
  const { t, locale } = useI18n()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    fetch(`/api/articles?limit=${FETCH_LIMIT}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(setArticles)
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section
        id="articles"
        data-analytics-section="articles"
        className="py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">{t('articles.kicker')}</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
              {t('articles.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
            {Array.from({ length: HOME_ARTICLES }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (loadFailed) {
    return (
      <section
        id="articles"
        data-analytics-section="articles"
        className="py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">{t('articles.kicker')}</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
              {t('articles.title')}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">{t('articles.unavailable')}</p>
        </div>
      </section>
    )
  }

  const displayed = articles.slice(0, HOME_ARTICLES)
  const hasMoreOnSite = articles.length > HOME_ARTICLES

  return (
    <section
      id="articles"
      data-analytics-section="articles"
      className="py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">{t('articles.kicker')}</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
              {t('articles.title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4 max-w-xl">
              {t('articles.subtitle')}
            </p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0" asChild>
            <a
              href="https://medium.com/@kevinhomorales"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="h-4 w-4" />
              {t('articles.viewMedium')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {displayed.map((article, index) => (
            <StaggerItem key={article.link} delay={index * 0.05}>
            <Card
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
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {article.excerpt}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(article.publishDate).toLocaleDateString(toBcp47(locale))}
                  </p>
                </CardContent>
              </a>
            </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {hasMoreOnSite ? (
          <ScrollReveal delay={0.1} className="mt-8 sm:mt-10 flex justify-center">
            <Button variant="outline" size="lg" className="gap-2 rounded-xl" asChild>
              <Link href="/articles">
                {t('articles.seeMore')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </ScrollReveal>
        ) : null}
      </div>
    </section>
  )
}
