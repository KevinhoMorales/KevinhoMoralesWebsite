'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, FileText } from 'lucide-react'

interface Article {
  title: string
  link: string
  publishDate: string
  excerpt: string
  image?: string
}

export function ArticlesSection() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/articles?limit=6')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(setArticles)
      .catch(() => setError('Artículos no disponibles.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section id="articles" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">Articles</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">Writing on Medium</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="articles" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">Articles</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">Writing on Medium</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="articles" className="scroll-mt-20 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <p className="text-primary font-medium tracking-wide uppercase text-xs sm:text-sm mb-3 sm:mb-4">Articles</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
              Writing on Medium
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4 max-w-xl">
              Technical articles on iOS, Android, Kotlin, Swift, and mobile development.
            </p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0" asChild>
            <a
              href="https://medium.com/@kevinhomorales"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="h-4 w-4" />
              View all on Medium
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {articles.map((article) => (
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    {new Date(article.publishDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
