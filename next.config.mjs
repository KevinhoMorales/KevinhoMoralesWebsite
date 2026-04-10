/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'miro.medium.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn-images-1.medium.com', pathname: '/**' },
      { protocol: 'https', hostname: 'assets.super.so', pathname: '/**' },
      { protocol: 'https', hostname: 'images.spr.so', pathname: '/**' },
      { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['@/components/ui'],
    /** Evita que webpack empaquete firebase-admin (gRPC); sin esto suele fallar el SSR con 500. */
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  /** Caché en disco de webpack a veces queda corrupta y `next dev` falla al restaurar (p. ej. hasStartTime). Memoria evita ese fallo. */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

export default nextConfig;
