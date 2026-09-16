import "server-only";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { seoPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSiteSettings } from "@/lib/db/queries/settings";

/** Builds page metadata for a static route, preferring an admin-set SEO override for that path. */
export async function buildPageMetadata(path: string): Promise<Metadata> {
  const settings = await getSiteSettings();
  const [override] = await db.select().from(seoPages).where(eq(seoPages.path, path)).limit(1);

  const title = override?.title ?? settings.defaultSeoTitle ?? settings.companyName;
  const description = override?.description ?? settings.defaultSeoDescription ?? undefined;
  const ogImage = override?.ogImage ?? settings.defaultOgImage ?? undefined;

  return {
    title,
    description,
    openGraph: { title, description, images: ogImage ? [ogImage] : undefined },
    twitter: { title, description },
  };
}
