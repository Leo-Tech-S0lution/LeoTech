import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { seoPages } from "@/lib/db/schema";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { getAllTeamMembersAdmin } from "@/lib/db/queries/team";
import { getSiteUrl, PRODUCTION_SITE_URL } from "@/lib/seo/site";
import { PageHeader } from "@/components/admin/page-header";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

type Level = "pass" | "warn" | "fail";
interface Check {
  label: string;
  level: Level;
  detail: string;
  fix?: { href: string; label: string };
}

const ICONS = { pass: CheckCircle2, warn: AlertTriangle, fail: XCircle };
const COLORS = { pass: "text-green-600", warn: "text-amber-500", fail: "text-red-600" };

/** Internal diagnostic only — checks the site's own SEO configuration, not live Google status. */
export default async function SeoHealthPage() {
  await requireAdmin();

  const [settings, [homeOverride], team, sitemapEntries] = await Promise.all([
    getSiteSettings(),
    db.select().from(seoPages).where(eq(seoPages.path, "/")).limit(1),
    getAllTeamMembersAdmin(),
    sitemap(),
  ]);
  const robotsConfig = robots();
  const siteUrl = getSiteUrl();

  const homeTitle = homeOverride?.title ?? settings.defaultSeoTitle ?? "";
  const homeDescription = homeOverride?.description ?? settings.defaultSeoDescription ?? "";
  const ogImage = homeOverride?.ogImage ?? settings.defaultOgImage ?? "";
  const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules : [robotsConfig.rules];
  const blocksRoot = rules.some((r) => [r.disallow].flat().includes("/"));
  const publicTeam = team.filter((m) => m.published && m.isActive);
  const thinProfiles = publicTeam.filter((m) => !m.position || !m.bio || !m.image);
  const teamInSitemap = sitemapEntries.filter((e) => e.url.includes("/team/")).length;
  const socials = (settings.socialLinks ?? []).filter((s) => /^https?:\/\//.test(s.url));

  const checks: Check[] = [
    {
      label: "Homepage title",
      level: !homeTitle ? "fail" : homeTitle.includes(settings.companyName) ? "pass" : "warn",
      detail: homeTitle ? `“${homeTitle}”` : "No homepage title set.",
      fix: { href: "/admin/settings", label: "Site Settings" },
    },
    {
      label: "Homepage description",
      level: !homeDescription ? "fail" : homeDescription.length >= 70 && homeDescription.length <= 160 ? "pass" : "warn",
      detail: homeDescription
        ? `${homeDescription.length} characters (aim for 70–160).`
        : "No meta description set.",
      fix: { href: "/admin/settings", label: "Site Settings" },
    },
    {
      label: "Canonical domain",
      level: siteUrl === PRODUCTION_SITE_URL ? "pass" : "warn",
      detail:
        siteUrl === PRODUCTION_SITE_URL
          ? `All canonical URLs use ${siteUrl}.`
          : `NEXT_PUBLIC_SITE_URL is ${process.env.NEXT_PUBLIC_SITE_URL ?? "not set"} — production should be ${PRODUCTION_SITE_URL}.`,
    },
    {
      label: "HTTPS",
      level: siteUrl.startsWith("https://") ? "pass" : "fail",
      detail: siteUrl.startsWith("https://")
        ? "Site URL is HTTPS; http:// and www. requests on the production domain 301 to it."
        : "Site URL is not HTTPS.",
    },
    {
      label: "Sitemap",
      level: sitemapEntries.length > 0 ? "pass" : "fail",
      detail: `${sitemapEntries.length} URLs, including ${teamInSitemap} team profile(s). ${siteUrl}/sitemap.xml`,
    },
    {
      label: "robots.txt",
      level: blocksRoot ? "fail" : "pass",
      detail: blocksRoot ? "robots.txt blocks the whole site!" : "Public pages crawlable; /admin and /api disallowed.",
    },
    {
      label: "Organization schema",
      level: settings.email && (settings.phone || settings.address) ? "pass" : "warn",
      detail: `Published on the homepage. Email: ${settings.email ? "✓" : "missing"}, phone: ${settings.phone ? "✓" : "missing"}, address: ${settings.address ? "✓" : "missing"}, official social profiles: ${socials.length}.`,
      fix: { href: "/admin/settings", label: "Site Settings" },
    },
    { label: "Website schema", level: "pass", detail: "WebSite JSON-LD is published on the homepage." },
    {
      label: "Team profile metadata",
      level: thinProfiles.length === 0 ? "pass" : "warn",
      detail:
        thinProfiles.length === 0
          ? `${publicTeam.length} public profile(s), each with a unique title, description, canonical and ProfilePage schema.`
          : `Missing designation, short bio or photo: ${thinProfiles.map((m) => m.name).join(", ")}.`,
      fix: { href: "/admin/team", label: "Team" },
    },
    {
      label: "Open Graph image",
      level: !ogImage ? "warn" : /\.svg(\?|$)/i.test(ogImage) ? "warn" : "pass",
      detail: !ogImage
        ? "No default share image set."
        : /\.svg(\?|$)/i.test(ogImage)
          ? "Default share image is an SVG — Facebook, LinkedIn and X don't render SVG. Upload a 1200×630 PNG/JPG."
          : "Default share image set.",
      fix: { href: "/admin/settings", label: "Site Settings" },
    },
    { label: "Favicon", level: "pass", detail: "PNG favicon (48/192px), SVG icon and 180px Apple touch icon." },
    {
      label: "Google verification",
      level: process.env.GOOGLE_SITE_VERIFICATION ? "pass" : "warn",
      detail: process.env.GOOGLE_SITE_VERIFICATION
        ? "google-site-verification meta tag is emitted."
        : "GOOGLE_SITE_VERIFICATION is not set. Not needed if you verify the Domain property via DNS (recommended).",
    },
  ];

  const passed = checks.filter((c) => c.level === "pass").length;

  return (
    <div>
      <PageHeader
        title="SEO Health"
        description={`${passed} of ${checks.length} checks passing. This checks the site's configuration — indexing itself is controlled by Google.`}
      />
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {checks.map((c) => {
          const Icon = ICONS[c.level];
          return (
            <li key={c.label} className="flex items-start gap-3 px-5 py-4">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${COLORS[c.level]}`} aria-label={c.level} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-navy-900">{c.label}</p>
                <p className="mt-0.5 break-words text-xs text-slate-500">{c.detail}</p>
              </div>
              {c.fix && c.level !== "pass" ? (
                <Link href={c.fix.href} className="shrink-0 text-xs font-medium text-blue-600 hover:underline">
                  {c.fix.label}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-slate-500">
        After deploying, submit <span className="font-mono">{siteUrl}/sitemap.xml</span> in Google Search Console and use URL
        Inspection on the homepage — see the README&apos;s “Google Search Console” section.
      </p>
    </div>
  );
}
