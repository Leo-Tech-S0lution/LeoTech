import type { SiteSettings } from "@/lib/db/schema";

/** Only real, absolute http(s) profile URLs belong in sameAs. */
function officialProfiles(settings: SiteSettings): string[] {
  return (settings.socialLinks ?? []).map((s) => s.url.trim()).filter((u) => /^https?:\/\/[^\s]+\.[^\s]+/i.test(u));
}

export function organizationJsonLd(settings: SiteSettings, siteUrl: string) {
  const sameAs = officialProfiles(settings);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: settings.companyName,
    url: `${siteUrl}/`,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/brand/icon-512.png`,
      width: 512,
      height: 512,
    },
    description: settings.defaultSeoDescription ?? undefined,
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    address: settings.address ? { "@type": "PostalAddress", streetAddress: settings.address } : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

export function websiteJsonLd(settings: SiteSettings, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: settings.companyName,
    url: `${siteUrl}/`,
    inLanguage: "en",
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
