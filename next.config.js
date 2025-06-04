/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    domains: [
      'localhost',
      'picsum.photos',
      'images.unsplash.com',
      'via.placeholder.com',
      'example.com',
      // Thêm các domains khác mà bạn sử dụng cho ảnh
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Các cấu hình khác của Next.js
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
