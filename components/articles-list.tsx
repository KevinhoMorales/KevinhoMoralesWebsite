'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useI18n } from '@/components/i18n/locale-provider';
import { toBcp47 } from '@/lib/i18n/bcp47';
import { Button } from '@/components/ui/button';

/** Máximo del feed RSS (~10); el API acepta hasta 50 por compatibilidad. */
const LIST_LIMIT = 50;

const MEDIUM_PROFILE = 'https://medium.com/@kevinhomorales';

interface Article {
  title: string;
  link: string;
  publishDate: string;
  excerpt: string;
  image?: string;
}

export function ArticlesList() {
  const { t, locale } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/articles?limit=${LIST_LIMIT}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error('Bad shape');
        setArticles(data as Article[]);
      })
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse h-48 rounded-lg bg-muted" />;
  if (loadFailed) return <p className="text-muted-foreground">{t('articles.unavailable')}</p>;

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {articles.map((article) => (
          <Link
            key={article.link}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            {article.image && (
              <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={article.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium line-clamp-2 hover:text-primary">{article.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{article.excerpt}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(article.publishDate).toLocaleDateString(toBcp47(locale))}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {articles.length > 0 ? (
        <div className="flex flex-col items-center gap-4 pt-6 border-t border-border/60">
          <p className="text-sm text-muted-foreground text-center max-w-lg leading-relaxed">
            {t('articles.fullArchiveOnMedium')}
          </p>
          <Button variant="outline" size="lg" className="gap-2 rounded-xl" asChild>
            <a href={MEDIUM_PROFILE} target="_blank" rel="noopener noreferrer">
              {t('articles.viewMedium')}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
