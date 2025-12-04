import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: [
      'picsum.photos',
      'www.anilibria.tv', 
      'anilibria.tv', 
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/anilibria/:path*',
        destination: 'https://www.anilibria.tv/api/:path*', 
      },
    ];
  },
};

module.exports = nextConfig;

