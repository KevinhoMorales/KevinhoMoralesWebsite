import { PodcastSection } from '@/components/podcast-section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Podcast | DevLokos - Kevin Morales',
  description: 'DevLokos podcast - tech and software development interviews',
};

export default function PodcastPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">DevLokos Podcast</h1>
      <p className="text-muted-foreground mb-8">
        El podcast más loco de tech y desarrollo de software. Entrevistas con
        líderes IT y desarrolladores de Latinoamérica.
      </p>
      <PodcastSection />
    </main>
  );
}
