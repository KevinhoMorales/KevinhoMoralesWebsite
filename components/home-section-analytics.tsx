'use client';

import { useEffect, useRef } from 'react';

import { logAnalyticsEvent } from '@/lib/analytics-events';

/**
 * Una vez por sección cuando ~15% visible (home): evento `section_view` en Firebase/GA4.
 */
export function HomeSectionAnalytics() {
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-analytics-section]');
    if (nodes.length === 0) return;

    const observers: IntersectionObserver[] = [];

    nodes.forEach((el) => {
      const sectionId = el.dataset.analyticsSection?.trim();
      if (!sectionId) return;

      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting || seen.current.has(sectionId)) continue;
            seen.current.add(sectionId);
            void logAnalyticsEvent('section_view', {
              section_id: sectionId,
              page_path: typeof window !== 'undefined' ? window.location.pathname : '/',
            });
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return null;
}
