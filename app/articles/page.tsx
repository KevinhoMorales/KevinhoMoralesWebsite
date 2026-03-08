import { ArticlesList } from '@/components/articles-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Articles | Kevin Morales - Medium',
  description: 'Technical articles on iOS, Android, Kotlin, Swift by Kevin Morales',
};

export default function ArticlesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Articles</h1>
      <p className="text-muted-foreground mb-8">
        Technical writing on Medium - Swift, Kotlin, Android, iOS development.
      </p>
      <ArticlesList />
    </main>
  );
}
