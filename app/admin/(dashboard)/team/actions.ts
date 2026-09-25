"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { teamMembers, teamMemberSlugHistory, type TeamMember } from "@/lib/db/schema";
import { getTeamMemberByIdAdmin, isSlugTaken } from "@/lib/db/queries/team";
import { teamMemberSchema, type TeamMemberInput } from "@/lib/validation/team";
import { toActionError, type ActionResult } from "@/lib/validation/common";
import { composeName, profilePath, profileUrl, slugFromName } from "@/lib/team/profile";
import { notifyAdmin } from "@/lib/mail/mailer";

const FORBIDDEN = { success: false as const, error: "You don't have permission to do that." };

function revalidateTeamPaths(...slugs: (string | null | undefined)[]) {
  revalidatePath("/admin/team");
  revalidatePath("/admin/qr-management");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/team");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) if (slug) revalidatePath(profilePath(slug));
}

function parseInput(input: unknown): { ok: true; data: TeamMemberInput } | { ok: false; error: string } {
  const parsed = teamMemberSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const data = parsed.data;
  const composed = composeName(data.firstName, data.middleName, data.lastName);
  return { ok: true, data: { ...data, name: composed || data.name } };
}

/** First free slug derived from `base` (base, base-2, base-3, …). */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = base || "member";
  for (let n = 1; n < 100; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    if (!(await isSlugTaken(candidate, excludeId))) return candidate;
  }
  throw new Error("Could not find a free slug.");
}

/** Client-side helper for the form: is this slug free for this member? */
export async function checkSlugAvailabilityAction(slug: string, excludeId?: string): Promise<ActionResult<boolean>> {
  await requireAdmin();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { success: true, data: false };
  return { success: true, data: !(await isSlugTaken(slug, excludeId)) };
}

export async function createTeamMemberAction(input: unknown): Promise<ActionResult<TeamMember>> {
  const user = await requireAdmin();
  if (!can(user, "team.edit")) return FORBIDDEN;

  const parsed = parseInput(input);
  if (!parsed.ok) return { success: false, error: parsed.error };
  const { slug: requestedSlug, ...data } = parsed.data;
  const manage = can(user, "team.manage");

  try {
    let slug: string;
    if (requestedSlug) {
      if (await isSlugTaken(requestedSlug)) {
        return { success: false, error: `The profile URL /team/${requestedSlug} is already in use.` };
      }
      slug = requestedSlug;
    } else {
      slug = await uniqueSlug(slugFromName(data.name));
    }

    // Editors can create members but not set verification/visibility/QR controls.
    const values = {
      ...data,
      slug,
      isVerified: manage ? data.isVerified : false,
      isActive: manage ? data.isActive : true,
      qrEnabled: manage ? data.qrEnabled : true,
    };

    const row = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(teamMembers)
        .values({ ...values, qrGeneratedAt: values.qrEnabled ? new Date() : null })
        .returning();
      if (!created) throw new Error("Insert failed");
      await tx.insert(teamMemberSlugHistory).values({ teamMemberId: created.id, slug, isCurrent: true });
      return created;
    });

    revalidateTeamPaths(row.slug);
    after(() =>
      notifyAdmin(
        `New team member: ${row.name}`,
        [
          `${row.name}${row.position ? ` — ${row.position}` : ""} was added by ${user.name}.`,
          `Public profile: ${profileUrl(row.slug)}`,
          row.qrEnabled ? "A QR code for their ID card is ready in QR Management." : "QR is disabled for this member.",
        ],
        `/admin/team/${row.id}`,
      ),
    );
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug or employee ID");
  }
}

export async function updateTeamMemberAction(id: string, input: unknown): Promise<ActionResult<TeamMember>> {
  const user = await requireAdmin();
  if (!can(user, "team.edit")) return FORBIDDEN;

  const parsed = parseInput(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  const existing = await getTeamMemberByIdAdmin(id);
  if (!existing) return { success: false, error: "Team member not found." };

  const manage = can(user, "team.manage");
  const { slug: requestedSlug, ...data } = parsed.data;
  // Only owners may change the permanent URL or the verification / visibility / QR controls.
  const slug = manage && requestedSlug ? requestedSlug : existing.slug;
  const values = {
    ...data,
    slug,
    isVerified: manage ? data.isVerified : existing.isVerified,
    isActive: manage ? data.isActive : existing.isActive,
    published: manage ? data.published : existing.published,
    qrEnabled: manage ? data.qrEnabled : existing.qrEnabled,
    updatedAt: new Date(),
  };

  try {
    const slugChanged = slug !== existing.slug;
    if (slugChanged && (await isSlugTaken(slug, id))) {
      return { success: false, error: `The profile URL /team/${slug} is already in use.` };
    }

    const row = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(teamMembers)
        .set({
          ...values,
          // Enabling QR for the first time generates it; profile edits never regenerate it.
          qrGeneratedAt: values.qrEnabled && !existing.qrGeneratedAt ? new Date() : existing.qrGeneratedAt,
        })
        .where(eq(teamMembers.id, id))
        .returning();
      if (!updated) throw new Error("Update failed");

      if (slugChanged) {
        // Keep the old slug as a redirecting alias so printed QR codes keep working.
        await tx
          .update(teamMemberSlugHistory)
          .set({ isCurrent: false })
          .where(eq(teamMemberSlugHistory.teamMemberId, id));
        await tx
          .insert(teamMemberSlugHistory)
          .values({ teamMemberId: id, slug: existing.slug, isCurrent: false })
          .onConflictDoNothing();
        const [reused] = await tx
          .update(teamMemberSlugHistory)
          .set({ isCurrent: true })
          .where(and(eq(teamMemberSlugHistory.teamMemberId, id), eq(teamMemberSlugHistory.slug, slug)))
          .returning();
        if (!reused) {
          await tx.insert(teamMemberSlugHistory).values({ teamMemberId: id, slug, isCurrent: true });
        }
      }
      return updated;
    });

    revalidateTeamPaths(row.slug, existing.slug);
    if (existing.isActive && !row.isActive) notifyDeactivated(row, user.name);
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "slug or employee ID");
  }
}

function notifyDeactivated(member: TeamMember, by: string) {
  after(() =>
    notifyAdmin(
      `Team member deactivated: ${member.name}`,
      [
        `${member.name}'s digital profile was deactivated by ${by}.`,
        `Scanning their ID-card QR now shows "Profile Unavailable".`,
      ],
      `/admin/team/${member.id}`,
    ),
  );
}

export async function setTeamMemberActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!can(user, "team.manage")) return FORBIDDEN;

  try {
    const [row] = await db
      .update(teamMembers)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    if (!row) return { success: false, error: "Team member not found." };
    revalidateTeamPaths(row.slug);
    if (!isActive) notifyDeactivated(row, user.name);
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}

export async function setTeamMemberVerifiedAction(id: string, isVerified: boolean): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!can(user, "team.manage")) return FORBIDDEN;

  try {
    const [row] = await db
      .update(teamMembers)
      .set({ isVerified, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    if (!row) return { success: false, error: "Team member not found." };
    revalidateTeamPaths(row.slug);
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteTeamMemberAction(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!can(user, "team.delete")) return FORBIDDEN;

  try {
    const [row] = await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning();
    revalidateTeamPaths(row?.slug);
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
