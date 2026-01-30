const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'wardrobe-api-hikg.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Everything starting with /api goes to your Python/Render backend.
        // Because our location route is now /location-service, it stays in
        // Next.js and uses our high-quality sorting logic.
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://localhost:8000/:path*'
          : 'https://wardrobe-api-hikg.onrender.com/:path*',
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
