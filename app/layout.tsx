import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseAnalytics } from '@/components/firebase-analytics';
import { CalendlyWidget } from '@/components/calendly-widget';
import { Navigation } from '@/components/sections/navigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const SITE_URL = 'https://kevinhomorales.com';

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
  alternates: { canonical: SITE_URL },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://assets.calendly.com/assets/external/widget.css"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <FirebaseAnalytics />
          <CalendlyWidget />
          <Navigation />
          <div className="pt-14 sm:pt-16">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
