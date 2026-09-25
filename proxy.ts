import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "leotech_admin_session";

/**
 * Next.js 16 Proxy (formerly Middleware). Fast redirect for obviously
 * unauthenticated admin requests; the real authorization check (session
 * lookup in the database) still happens server-side via requireAdmin().
 */
export function proxy(request: NextRequest) {
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
  matcher: [
    "/((?!_next/static|_next/image|brand/|uploads/|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico)$).*)",
  ],
};