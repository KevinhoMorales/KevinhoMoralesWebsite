'use client';

import Script from 'next/script';

const UMAMI_WEBSITE_ID = '3b671931-429f-4d47-9f19-c9d40c7d125e';

export function UmamiAnalytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
    />
  );
}
