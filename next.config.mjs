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
    ],
  },
  experimental: {
    optimizePackageImports: ['@/components/ui'],
    /** Evita que webpack empaquete firebase-admin (gRPC); sin esto suele fallar el SSR con 500. */
    serverComponentsExternalPackages: ['firebase-admin'],
  },
};

export default nextConfig;
