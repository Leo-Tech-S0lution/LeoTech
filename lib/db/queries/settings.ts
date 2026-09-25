import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { siteSettings, type SiteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const FALLBACK: SiteSettings = {
  id: 1,
  companyName: "Leo Tech Solution",
  tagline: "Engineering software, systems, and skills for what's next.",
  footerDescription:
    "Leo Tech Solution builds custom software, AI/ML, IoT, and cloud systems — and trains the engineers who will run them.",
  email: "infoleotechsolution@gmail.com",
  phone: null,
  address: "",
  businessHours: "Mon – Fri, 9:00 AM – 6:00 PM",
  schedulingUrl: null,
  socialLinks: [],
  defaultSeoTitle: "Leo Tech Solution | Software, AI, IoT, Robotics & Technology Training",
  defaultSeoDescription:
    "Leo Tech Solution designs and builds custom software, AI/ML, IoT, cloud, and cybersecurity solutions, and runs a hands-on technology training academy.",
  defaultOgImage: "/brand/leotech-logo.svg",
  updatedAt: new Date(),
};

/** Request-memoized read of site settings, seeded with sane defaults if the row is missing. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  return row ?? FALLBACK;
});
