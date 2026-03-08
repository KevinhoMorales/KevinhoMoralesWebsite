'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Episode {
  videoId: string;
  title: string;
  thumbnail: string;
  publishDate: string;
}

interface PodcastEpisodesProps {
  limit?: number;
}

export function PodcastEpisodes({ limit = 12 }: PodcastEpisodesProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/podcast?limit=${limit}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(setEpisodes)
      .catch(() => setError('Podcast episodes unavailable. Configure YOUTUBE_API_KEY.'))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) return <div className="animate-pulse h-48 rounded-lg bg-muted" />;
  if (error) return <p className="text-muted-foreground">{error}</p>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {episodes.map((ep) => (
        <Link
          key={ep.videoId}
          href={`https://www.youtube.com/watch?v=${ep.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-lg border overflow-hidden transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-video">
            <Image
              src={ep.thumbnail}
              alt={ep.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium line-clamp-2 group-hover:text-primary">
              {ep.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(ep.publishDate).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
