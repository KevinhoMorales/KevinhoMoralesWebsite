import { getTestimonials } from '@/lib/content';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Testimonials | Kevin Morales',
  description: 'Recommendations and testimonials from colleagues and clients',
};

export default function TestimonialsPage() {
  const testimonials = getTestimonials();

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Testimonials</h1>
      <p className="text-muted-foreground mb-8">
        What colleagues and clients say about working with me.
      </p>
      <div className="space-y-6">
        {testimonials.map((t) => (
          <blockquote
            key={t.id}
            className="border-l-4 border-primary pl-6 py-2"
          >
            <p className="text-foreground mb-4">&ldquo;{t.quote}&rdquo;</p>
            <footer>
              {t.linkedinUrl ? (
                <Link
                  href={t.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-primary"
                >
                  {t.author}
                </Link>
              ) : (
                <span className="font-medium">{t.author}</span>
              )}
              <span className="text-muted-foreground">
                {' '}— {t.role}
                {t.company && ` at ${t.company}`}
              </span>
            </footer>
          </blockquote>
        ))}
      </div>
    </main>
  );
}
