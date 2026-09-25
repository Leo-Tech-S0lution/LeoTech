import "server-only";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { seoPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSiteSettings } from "@/lib/db/queries/settings";

interface PageSeoFallback {
  /** Page name, e.g. "About Us" — rendered as "About Us | Leo Tech Solution" by the root title template. */
  title?: string;
  description?: string;
}

/**
 * Builds page metadata for a static route, preferring an admin-set SEO override
 * for that path, then the page's own fallback, then the site defaults. Always
 * emits a self-referencing canonical so tracking parameters never create duplicates.
 */
export async function buildPageMetadata(path: string, fallback: PageSeoFallback = {}): Promise<Metadata> {
  const settings = await getSiteSettings();
  const [override] = await db.select().from(seoPages).where(eq(seoPages.path, path)).limit(1);

  const isHome = path === "/";
  const rawTitle =
    override?.title ?? (isHome ? null : fallback.title) ?? settings.defaultSeoTitle ?? settings.companyName;
  // Titles that already carry the brand (or the homepage default) skip the "| Leo Tech Solution" template.
  const absolute = isHome || rawTitle.includes(settings.companyName);
  const fullTitle = absolute ? rawTitle : `${rawTitle} | ${settings.companyName}`;
  const description =
    override?.description ?? fallback.description ?? settings.defaultSeoDescription ?? undefined;
  const ogImage = override?.ogImage ?? settings.defaultOgImage ?? undefined;

  return {
    title: absolute ? { absolute: rawTitle } : rawTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: fullTitle,
      description,
      url: path,
      siteName: settings.companyName,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: ogImage ? [ogImage] : undefined },
  };
}
