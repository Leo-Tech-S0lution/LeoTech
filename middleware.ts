import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "leotech_admin_session";

/**
 * Fast, edge-level redirect for obviously-unauthenticated admin requests.
 * This is a UX shortcut only — the real authorization check (session lookup
 * against the database) happens server-side in app/admin/layout.tsx via
 * requireAdmin(), since the Postgres driver isn't available on the edge runtime.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/admin/:path*"],
};
