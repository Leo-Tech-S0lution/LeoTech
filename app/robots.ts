import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Not a security boundary — /admin and /api enforce authentication server-side.
      disallow: ["/admin", "/api", "/team/*/vcard"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
