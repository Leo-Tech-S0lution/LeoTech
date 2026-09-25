import type { TeamMember } from "@/lib/db/schema";
import { absoluteUrl } from "@/lib/seo/site";
import { toSlug } from "@/lib/utils/text";

/** Site-relative public profile path. This is the permanent identity a printed QR points at. */
export function profilePath(slug: string): string {
  return `/team/${slug}`;
}

/** Absolute public profile URL — the only thing ever encoded into a member's QR code. */
export function profileUrl(slug: string): string {
  return absoluteUrl(profilePath(slug));
}

/** Composes a full name from its parts, skipping blanks. */
export function composeName(first?: string | null, middle?: string | null, last?: string | null): string {
  return [first, middle, last].map((p) => p?.trim()).filter(Boolean).join(" ");
}

export function slugFromName(name: string): string {
  return toSlug(name);
}

export type QrStatus = "generated" | "not_generated" | "disabled";

export function qrStatus(member: Pick<TeamMember, "qrEnabled" | "qrGeneratedAt">): QrStatus {
  if (!member.qrEnabled) return "disabled";
  return member.qrGeneratedAt ? "generated" : "not_generated";
}

export const QR_STATUS_LABELS: Record<QrStatus, string> = {
  generated: "Generated",
  not_generated: "Not Generated",
  disabled: "Disabled",
};

/** Admin-only profile completeness score (0–100) plus the list of missing items. */
export function profileCompleteness(m: TeamMember): { percent: number; missing: string[] } {
  const checks: [string, boolean][] = [
    ["Photo", Boolean(m.image)],
    ["Designation", Boolean(m.position)],
    ["Department", Boolean(m.department)],
    ["Employee ID", Boolean(m.employeeId)],
    ["Short bio", Boolean(m.bio)],
    ["Biography", Boolean(m.biography)],
    ["Contact (email or phone)", Boolean(m.email || m.phone)],
    ["Skills", (m.skills?.length ?? 0) > 0],
    ["Experience", (m.experience?.length ?? 0) > 0],
    ["Education", (m.education?.length ?? 0) > 0],
    ["Projects", (m.projects?.length ?? 0) > 0],
    ["Social links", (m.socialLinks?.length ?? 0) > 0],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter(([, ok]) => !ok).map(([label]) => label),
  };
}

/** Digits-only international number for tel:/wa.me links. Keeps a leading "+" for tel:. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export function whatsappHref(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}
