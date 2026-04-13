'use client';

import { useI18n } from '@/components/i18n/locale-provider';
import { TranslatedPageHeader } from '@/components/i18n/translated-page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
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
  const { t } = useI18n();

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <TranslatedPageHeader titleKey="pages.testimonials.title" descKey="pages.testimonials.desc" />
      <div className="space-y-6">
        {testimonials.map((item) => {
          const body = (
            <>
              <p className="text-foreground mb-4 leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
              <footer className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0 border border-primary/20">
                  <AvatarImage src={item.avatar} alt="" />
                  <AvatarFallback className="bg-secondary text-xs">{getInitials(item.author)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span
                    className={cn(
                      'font-medium block',
                      item.linkedinUrl && 'group-hover:text-primary transition-colors'
                    )}
                  >
                    {item.author}
                  </span>
                  <span className="text-muted-foreground block text-sm">
                    {item.role}
                    {item.company && ` at ${item.company}`}
                  </span>
                </div>
              </footer>
            </>
          );

          const blockClass = 'border-l-4 border-primary pl-6 py-2';

          if (item.linkedinUrl) {
            return (
              <a
                key={item.id}
                href={item.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group block rounded-r-lg outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
                aria-label={t('recommendations.linkedInCardAria', { name: item.author })}
              >
                <blockquote className={blockClass}>{body}</blockquote>
              </a>
            );
          }

          return (
            <blockquote key={item.id} className={blockClass}>
              {body}
            </blockquote>
          );
        })}
      </div>
    </main>
  );
}
