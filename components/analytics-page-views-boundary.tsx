'use client';

import { Suspense } from 'react';

import { AnalyticsPageViews } from '@/components/analytics-page-views';

/** `useSearchParams` requiere Suspense en el App Router. */
export function AnalyticsPageViewsBoundary() {
  return (
    <Suspense fallback={null}>
      <AnalyticsPageViews />
    </Suspense>
  );
}
