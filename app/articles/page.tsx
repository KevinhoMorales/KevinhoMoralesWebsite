import { ArticlesList } from '@/components/articles-list';
import { TranslatedPageHeader } from '@/components/i18n/translated-page-header';
import type { Metadata } from 'next';

import { withCanonical } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Articles | Kevin Morales',
  description:
    'Technical articles on Firebase, Cursor, GitKraken, and mobile development with Swift, Kotlin, and Dart.',
  ...withCanonical('/articles'),
};

export default function ArticlesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <TranslatedPageHeader titleKey="pages.articles.title" descKey="pages.articles.desc" />
      <ArticlesList />
    </main>
  );
}
