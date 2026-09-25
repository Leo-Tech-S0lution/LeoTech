import type { NextConfig } from "next";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

const nextConfig: NextConfig = {
  // Media is uploaded through the admin Media Library to Cloudinary. Scope
  // next/image's remote fetching to exactly that one account's upload path
  // (never a bare "**") so the built-in image optimizer can't double as an
  // open proxy for arbitrary URLs.
  images: {
    remotePatterns: cloudName
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            pathname: `/${cloudName}/image/upload/**`,
          },
        ]
      : [],
  },
  // Server actions default to a 1MB request body, which rejects most photos
  // before uploadMediaAction runs. Match storage.ts's 10MB MAX_SIZE (+ headroom
  // for multipart overhead).
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Browsers and crawlers request /favicon.ico by convention; serve the brand PNG.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/brand/icon-48.png" }];
  },
  // Canonical domain: www.* permanently redirects to the apex in a single hop
  // (path and query string preserved). Only matches the www host, so localhost
  // and preview deployments are unaffected. HTTP→HTTPS is handled by the host.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.leotechsolution.com.np" }],
        destination: "https://leotechsolution.com.np/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
