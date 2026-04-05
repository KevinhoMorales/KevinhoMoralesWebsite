import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Inter } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import './globals.css';
import { AnalyticsPageViewsBoundary } from '@/components/analytics-page-views-boundary';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseAnalytics } from '@/components/firebase-analytics';
import { CalendlyWidget } from '@/components/calendly-widget';
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
    default: 'Kevin Morales | Mobile & Software Engineer',
    template: '%s | Kevin Morales',
  },
  description:
    'Welcome to my personal site! I\'m Kevin Morales – Mobile engineer, community builder, and speaker. Building exceptional mobile experiences with iOS, Android, Flutter, and Web technologies.',
  keywords: [
    'Kevin Morales',
    'iOS',
    'Swift',
    'Android',
    'Kotlin',
    'DevLokos',
    'mobile developer',
    'Ecuador',
  ],
  authors: [{ name: 'Kevin Morales', url: SITE_URL }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Kevin Morales',
    title: 'Kevin Morales | Mobile & Software Engineer',
    description:
      'Welcome to my personal site! I\'m Kevin Morales – Mobile engineer, community builder, and speaker.',
    images: [
      {
        url: '/images/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'Kevin Morales - Mobile & Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kevin Morales | Mobile & Software Engineer',
    description:
      'Welcome to my personal site! I\'m Kevin Morales – Mobile engineer, community builder, and speaker.',
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
              <Analytics />
              <AnalyticsPageViewsBoundary />
              <CalendlyWidget />
              {/* Nav fuera de overflow-x-hidden para que el último enlace (Acceso) no quede recortado */}
              <Navigation />
              <div className="overflow-x-wrapper">
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
