import { ArticlesList } from '@/components/articles-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Articles | Kevin Morales',
  description:
    'Technical articles on Firebase, Cursor, GitKraken, and mobile development with Swift, Kotlin, and Dart.',
};

export default function ArticlesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Articles</h1>
      <p className="text-muted-foreground mb-8">
        Firebase, Cursor, GitKraken, and hands-on mobile engineering with Swift, Kotlin, and Dart.
      </p>
      <ArticlesList />
    </main>
  );
}
