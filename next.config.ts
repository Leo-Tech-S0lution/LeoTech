import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All media is uploaded through the admin Media Library and served locally
  // from /uploads, so next/image never needs to fetch a remote host. Leaving
  // remotePatterns empty (rather than wildcarding "**") keeps the built-in
  // image optimizer from doubling as an open proxy for arbitrary URLs.
  images: {
    remotePatterns: [],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
