'use client';

import Link from 'next/link';
import { TranslatedPageHeader } from '@/components/i18n/translated-page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Testimonial } from '@/types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

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
            <footer className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0 border border-primary/20">
                <AvatarImage src={item.avatar} alt={item.author} />
                <AvatarFallback className="bg-secondary text-xs">{getInitials(item.author)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
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
                <span className="text-muted-foreground block text-sm">
                  {item.role}
                  {item.company && ` at ${item.company}`}
                </span>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </main>
  );
}
