'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Article {
  title: string;
  link: string;
  publishDate: string;
  excerpt: string;
  image?: string;
}

interface ArticlesListProps {
  limit?: number;
}

export function ArticlesList({ limit = 10 }: ArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/articles?limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(setArticles)
      .catch(() => setError('Articles unavailable.'))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) return <div className="animate-pulse h-48 rounded-lg bg-muted" />;
  if (error) return <p className="text-muted-foreground">{error}</p>;

  return (
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
            <h3 className="font-medium line-clamp-2 hover:text-primary">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {article.excerpt}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(article.publishDate).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
