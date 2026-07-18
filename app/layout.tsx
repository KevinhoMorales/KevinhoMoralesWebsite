import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import './globals.css';
import { AnalyticsPageViewsBoundary } from '@/components/analytics-page-views-boundary';
import { ThemeProvider } from '@/components/theme-provider';
import { themeInitScriptContent } from '@/lib/theme-default';
import { FirebaseAnalytics } from '@/components/firebase-analytics';
import { UmamiAnalytics } from '@/components/umami-analytics';
import { CalendlyWidget } from '@/components/calendly-widget';
import { HashScroll } from '@/components/hash-scroll';
import { Navigation } from '@/components/sections/navigation';
import { SiteJsonLd } from '@/components/seo/site-json-ld';
import { WaitlistRoot } from '@/components/waitlist/waitlist-root';
import { ErrorBoundary } from '@/components/error-boundary';
import { LocaleProvider } from '@/components/i18n/locale-provider';
import { COOKIE_NAME, isLocale } from '@/lib/i18n/config';
import { localeFromAcceptLanguage } from '@/lib/i18n/detect-locale';
import { SITE_URL } from '@/lib/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Kevin Morales | Senior Software Engineer',
    template: '%s | Kevin Morales',
  },
  description:
    'Kevin Morales — Senior Software Engineer at SoFi building mobile banking platforms. Speaker, EDteam instructor, Cursor Ambassador. DevLokos, GDG, fintech & mobile architecture.',
  keywords: [
    'Kevin Morales',
    'Senior Software Engineer',
    'SoFi',
    'mobile banking',
    'Swift',
    'Kotlin',
    'fintech',
    'DevLokos',
    'speaker',
    'Ecuador',
  ],
  authors: [{ name: 'Kevin Morales', url: SITE_URL }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Kevin Morales',
    title: 'Kevin Morales | Senior Software Engineer',
    description:
      'Kevin Morales — Senior Software Engineer at SoFi, mobile banking architect, speaker, and EDteam instructor.',
    images: [
      {
        url: '/images/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'Kevin Morales - Senior Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kevin Morales | Senior Software Engineer',
    description:
      'Kevin Morales — Senior Software Engineer at SoFi, mobile banking architect, speaker, and EDteam instructor.',
    images: ['/images/og-preview.png'],
  },
  robots: { index: true, follow: true },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '256x256' },
    ],
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  const initialLocale = isLocale(raw)
    ? raw
    : localeFromAcceptLanguage((await headers()).get('accept-language'));

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScriptContent() }}
        />
        <link
          href="https://assets.calendly.com/assets/external/widget.css"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <SiteJsonLd />
        <LocaleProvider initialLocale={initialLocale}>
          <ThemeProvider>
            <WaitlistRoot>
              <FirebaseAnalytics />
              <UmamiAnalytics />
              <Analytics />
              <AnalyticsPageViewsBoundary />
              <CalendlyWidget />
              <HashScroll />
              {/* Nav fuera de page-root: evita recortar dropdowns; el scroll horizontal lo cortan html/body + page-root */}
              <Navigation />
              <div className="page-root">
                <div className="pt-14 sm:pt-16">
                  <ErrorBoundary>{children}</ErrorBoundary>
                </div>
              </div>
            </WaitlistRoot>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
