import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "leotech_admin_session";

/**
 * Canonical production host (from NEXT_PUBLIC_SITE_URL), e.g. "leotechsolution.com.np".
 * Null when the site URL isn't a real public HTTPS domain (localhost, IPs, http://),
 * so local `npm start` is never redirected to https://localhost.
 */
const CANONICAL_HOST = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://leotechsolution.com.np");
    const isLocal = url.hostname === "localhost" || /^[\d.]+$/.test(url.hostname) || url.hostname.endsWith(".local");
    return url.protocol === "https:" && !isLocal ? url.host : null;
  } catch {
    return null;
  }
})();

/**
 * 1. Canonical domain: 301 www.* → apex and http → https, but only for the
 *    production domain so localhost and preview deployments are unaffected.
 * 2. Fast, edge-level redirect for obviously-unauthenticated admin requests.
 *    This is a UX shortcut only — the real authorization check (session lookup
 *    against the database) happens server-side via requireAdmin(), since the
 *    Postgres driver isn't available on the edge runtime.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const proto = request.headers.get("x-forwarded-proto");

  const isWww = CANONICAL_HOST !== null && host === `www.${CANONICAL_HOST}`;
  const isInsecure = CANONICAL_HOST !== null && host === CANONICAL_HOST && proto === "http";
  if (process.env.NODE_ENV === "production" && (isWww || isInsecure)) {
    return NextResponse.redirect(`https://${CANONICAL_HOST}${pathname}${search}`, 301);
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasCookie = request.cookies.has(SESSION_COOKIE);
    if (!hasCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image|brand/|uploads/|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$).*)"],
};
