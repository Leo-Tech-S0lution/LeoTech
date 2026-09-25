/** Official production domain. Used whenever NEXT_PUBLIC_SITE_URL isn't set, so metadata never points at localhost. */
export const PRODUCTION_SITE_URL = "https://leotechsolution.com.np";

/** Canonical site origin without a trailing slash, e.g. "https://leotechsolution.com.np". */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_SITE_URL;
  return raw.replace(/\/+$/, "");
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
