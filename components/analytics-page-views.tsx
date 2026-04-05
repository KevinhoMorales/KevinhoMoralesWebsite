'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { logAnalyticsPageView } from '@/lib/firebase';

/**
 * Envía `page_view` a Firebase / GA4 en transiciones cliente de Next.js
 * (sin recarga completa). La carga inicial la registra el SDK automáticamente.
 */
export function AnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    const qs = searchParams?.toString();
    const pathWithSearch = qs ? `${pathname}?${qs}` : pathname;
    if (lastSent.current === null) {
      lastSent.current = pathWithSearch;
      return;
    }
    if (lastSent.current === pathWithSearch) return;
    lastSent.current = pathWithSearch;
    void logAnalyticsPageView(pathWithSearch);
  }, [pathname, searchParams]);

  return null;
}
