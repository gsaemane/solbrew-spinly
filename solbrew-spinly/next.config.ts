import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint warnings during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors (if still needed)
  },
  images: {
    unoptimized: true, // Disable next/image optimization for Netlify
  },
};

export default nextConfig;
