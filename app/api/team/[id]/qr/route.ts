import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { getTeamMemberByIdAdmin } from "@/lib/db/queries/team";
import { profileUrl } from "@/lib/team/profile";
import { qrPng, qrSvg } from "@/lib/team/qr";

/**
 * GET /api/team/:id/qr?format=png|svg&size=1024&download=1
 * Admin-only. Renders the member's ID-card QR, which encodes only their public profile URL.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(user, "qr.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await getTeamMemberByIdAdmin(id);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!member.qrEnabled) return NextResponse.json({ error: "QR is disabled for this member." }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const format = searchParams.get("format") === "svg" ? "svg" : "png";
  const size = Number(searchParams.get("size")) || 1024;
  const filename = `leotech-qr-${member.slug}-v${member.qrVersion}.${format}`;

  const headers: Record<string, string> = {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex",
  };
  if (searchParams.get("download")) headers["Content-Disposition"] = `attachment; filename="${filename}"`;

  const url = profileUrl(member.slug);
  if (format === "svg") {
    return new NextResponse(await qrSvg(url), {
      headers: { ...headers, "Content-Type": "image/svg+xml; charset=utf-8" },
    });
  }
  return new NextResponse(new Uint8Array(await qrPng(url, size)), {
    headers: { ...headers, "Content-Type": "image/png" },
  });
}
