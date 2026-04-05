import { getTestimonials } from '@/lib/content';
import { TestimonialsPageClient } from '@/components/pages/testimonials-page-client';
import type { Metadata } from 'next';

import { withCanonical } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Testimonials | Kevin Morales',
  description: 'Recommendations and testimonials from colleagues and clients',
  ...withCanonical('/testimonials'),
};

export default function TestimonialsPage() {
  const testimonials = getTestimonials();
  return <TestimonialsPageClient testimonials={testimonials} />;
}
