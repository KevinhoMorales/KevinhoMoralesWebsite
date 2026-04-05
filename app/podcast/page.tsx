import { PodcastSection } from '@/components/podcast-section';
import { TranslatedPageHeader } from '@/components/i18n/translated-page-header';
import type { Metadata } from 'next';

import { withCanonical } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Podcast | DevLokos - Kevin Morales',
  description: 'DevLokos podcast - tech and software development interviews',
  ...withCanonical('/podcast'),
};

export default function PodcastPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <TranslatedPageHeader titleKey="pages.podcast.title" descKey="pages.podcast.desc" />
      <PodcastSection />
    </main>
  );
}
