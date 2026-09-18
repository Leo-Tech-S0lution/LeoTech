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
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
