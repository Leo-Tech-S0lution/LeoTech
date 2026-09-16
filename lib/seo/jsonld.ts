import type { SiteSettings } from "@/lib/db/schema";

export function organizationJsonLd(settings: SiteSettings, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.companyName,
    url: siteUrl,
    logo: `${siteUrl}/brand/leotech-logo.svg`,
    description: settings.defaultSeoDescription ?? undefined,
    email: settings.email ?? undefined,
    telephone: settings.phone ?? undefined,
    sameAs: (settings.socialLinks ?? []).map((s) => s.url),
  };
}

export function websiteJsonLd(settings: SiteSettings, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.companyName,
    url: siteUrl,
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
