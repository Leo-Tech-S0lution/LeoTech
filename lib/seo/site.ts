/**
 * Canonical site origin — the single authoritative URL for metadata, canonicals,
 * sitemap, robots, Open Graph, JSON-LD and team QR codes. Apex, HTTPS, no trailing slash.
 */
export const SITE_URL = "https://leotechsolution.com.np";

/** @deprecated alias kept for existing imports; use SITE_URL. */
export const PRODUCTION_SITE_URL = SITE_URL;

function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || /^[\d.]+$/.test(hostname) || hostname.endsWith(".local");
}

/**
 * Normalises a configured site URL to canonical form: public hosts are forced to
 * https and stripped of "www.", so a misconfigured env var can never emit
 * www/http URLs. Local hosts (dev) are left as-is.
 */
export function normalizeSiteUrl(raw: string | undefined | null): string {
  if (!raw?.trim()) return SITE_URL;
  try {
    const url = new URL(raw.trim());
    if (isLocalHost(url.hostname)) return url.origin;
    const host = url.host.replace(/^www\./i, "");
    return `https://${host}`;
  } catch {
    return SITE_URL;
  }
}

/** Canonical site origin without a trailing slash, e.g. "https://leotechsolution.com.np". */
export function getSiteUrl(): string {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
