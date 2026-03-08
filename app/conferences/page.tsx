import { getConferences } from '@/lib/content';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conferences | Kevin Morales - Speaker',
  description: 'Conference talks and speaker engagements by Kevin Morales',
};

export default function ConferencesPage() {
  const conferences = getConferences();

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Conferences & Talks</h1>
      <p className="text-muted-foreground mb-8">
        Speaker engagements at DevFest, Google I/O Extended, GDG events, and more.
      </p>
      <div className="space-y-4">
        {conferences.map((conf) => (
          <article
            key={conf.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border"
          >
            <div className="flex-1">
              <h3 className="font-semibold">{conf.title}</h3>
              {conf.topic && (
                <p className="text-sm text-muted-foreground mt-1">{conf.topic}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs rounded bg-muted px-2 py-0.5">{conf.type}</span>
                {conf.tags?.map((tag) => (
                  <span key={tag} className="text-xs rounded bg-muted px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {conf.videoUrl && (
              <Link
                href={conf.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline shrink-0"
              >
                Watch →
              </Link>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
