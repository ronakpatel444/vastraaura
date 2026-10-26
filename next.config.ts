import type { NextConfig } from "next";
import os from "os";

function getLocalDevOrigins(): string[] {
  const origins = new Set<string>([
    'localhost',
    '127.0.0.1',
    '192.168.1.12',
    '192.168.1.28',
  ]);

  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          origins.add(net.address);
          origins.add(`${net.address}:3000`);
        }
      }
    }
  } catch (e) {
    // fallback
  }

  return Array.from(origins);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'media.green-api.com',
      },
      {
        protocol: 'https',
        hostname: '*.green-api.com',
      },
    ],
  },
  // Allow access from local network for testing on phone & other devices
  // @ts-ignore
  allowedDevOrigins: getLocalDevOrigins(),
};

export default nextConfig;
