import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Allow access from local network for testing on phone
  // @ts-ignore
  allowedDevOrigins: ['192.168.1.28'],
};

export default nextConfig;
