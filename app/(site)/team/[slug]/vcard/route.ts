import { NextResponse } from "next/server";
import { resolveProfileSlug } from "@/lib/db/queries/team";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { profileUrl } from "@/lib/team/profile";

/** vCard 3.0 text escaping (RFC 2426). */
function esc(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

/** GET /team/:slug/vcard — "Save Contact" download for an active member's profile. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lookup = await resolveProfileSlug(slug);
  if (lookup.kind !== "found" || !lookup.member.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const m = lookup.member;
  const settings = await getSiteSettings();
  const org = settings.companyName || "Leo Tech Solution";
  const last = m.lastName ?? "";
  const first = m.firstName ? [m.firstName, m.middleName].filter(Boolean).join(" ") : m.name;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(last)};${esc(first)};;;`,
    `FN:${esc(m.name)}`,
    `ORG:${esc(org)}`,
    m.position ? `TITLE:${esc(m.position)}` : null,
    m.phone ? `TEL;TYPE=WORK,VOICE:${esc(m.phone)}` : null,
    m.whatsapp && m.whatsapp !== m.phone ? `TEL;TYPE=CELL:${esc(m.whatsapp)}` : null,
    m.email ? `EMAIL;TYPE=WORK,INTERNET:${esc(m.email)}` : null,
    `URL:${profileUrl(m.slug)}`,
    "END:VCARD",
  ].filter(Boolean);

  return new NextResponse(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${m.slug}.vcf"`,
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, max-age=300",
    },
  });
}
