import type { Metadata } from 'next';

/** URL pública del sitio (SEO, JSON-LD, canonical). */
export const SITE_URL = 'https://kevinhomorales.com' as const;

/** Canonical + Open Graph URL por ruta (evita un único canonical en el layout para toda la app). */
export function withCanonical(path: string): Pick<Metadata, 'alternates' | 'openGraph'> {
  const pathNorm = path.startsWith('/') ? path : `/${path}`;
  const absolute = pathNorm === '/' ? SITE_URL : `${SITE_URL}${pathNorm}`;
  return {
    alternates: { canonical: absolute },
    openGraph: { url: absolute },
  };
}
