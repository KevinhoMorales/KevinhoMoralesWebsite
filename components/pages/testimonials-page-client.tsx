'use client';

import Link from 'next/link';
import { TranslatedPageHeader } from '@/components/i18n/translated-page-header';
import type { Testimonial } from '@/types';

export function TestimonialsPageClient({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <TranslatedPageHeader titleKey="pages.testimonials.title" descKey="pages.testimonials.desc" />
      <div className="space-y-6">
        {testimonials.map((item) => (
          <blockquote
            key={item.id}
            className="border-l-4 border-primary pl-6 py-2"
          >
            <p className="text-foreground mb-4">&ldquo;{item.quote}&rdquo;</p>
            <footer>
              {item.linkedinUrl ? (
                <Link
                  href={item.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-primary"
                >
                  {item.author}
                </Link>
              ) : (
                <span className="font-medium">{item.author}</span>
              )}
              <span className="text-muted-foreground">
                {' '}— {item.role}
                {item.company && ` at ${item.company}`}
              </span>
            </footer>
          </blockquote>
        ))}
      </div>
    </main>
  );
}
