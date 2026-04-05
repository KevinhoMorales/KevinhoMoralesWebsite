import { getConferences } from '@/lib/content';
import { ConferencesPageClient } from '@/components/pages/conferences-page-client';
import type { Metadata } from 'next';

import { withCanonical } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Conferences | Kevin Morales - Speaker',
  description: 'Conference talks and speaker engagements by Kevin Morales',
  ...withCanonical('/conferences'),
};

export default async function ConferencesPage() {
  const conferences = await getConferences();
  return <ConferencesPageClient conferences={conferences} />;
}
