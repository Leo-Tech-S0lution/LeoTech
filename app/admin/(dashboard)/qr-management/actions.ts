"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { toActionError, type ActionResult } from "@/lib/validation/common";
import { notifyAdmin } from "@/lib/mail/mailer";

const FORBIDDEN = { success: false as const, error: "You don't have permission to manage QR codes." };

function revalidateQrPaths() {
  revalidatePath("/admin/qr-management");
  revalidatePath("/admin/team");
}

/** Generates QR codes for the given members that don't have one yet (QR-enabled only). */
export async function generateQrAction(ids: string[]): Promise<ActionResult<number>> {
  const user = await requireAdmin();
  if (!can(user, "qr.manage")) return FORBIDDEN;
  if (ids.length === 0) return { success: true, data: 0 };

  try {
    const rows = await db
      .update(teamMembers)
      .set({ qrGeneratedAt: new Date() })
      .where(and(inArray(teamMembers.id, ids), eq(teamMembers.qrEnabled, true), isNull(teamMembers.qrGeneratedAt)))
      .returning({ name: teamMembers.name });
    revalidateQrPaths();
    if (rows.length > 0) {
      after(() =>
        notifyAdmin(
          `QR codes generated (${rows.length})`,
          [`${user.name} generated ID-card QR codes for: ${rows.map((r) => r.name).join(", ")}.`],
          "/admin/qr-management",
        ),
      );
    }
    return { success: true, data: rows.length };
  } catch (err) {
    return toActionError(err);
  }
}

/**
 * Re-issues the QR artwork (new generated-at timestamp and version number).
 * The encoded profile URL is unchanged, so previously printed cards keep working.
 */
export async function regenerateQrAction(id: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!can(user, "qr.manage")) return FORBIDDEN;

  try {
    const [row] = await db
      .update(teamMembers)
      .set({ qrGeneratedAt: new Date(), qrVersion: sql`${teamMembers.qrVersion} + 1` })
      .where(and(eq(teamMembers.id, id), eq(teamMembers.qrEnabled, true)))
      .returning({ id: teamMembers.id });
    if (!row) return { success: false, error: "QR is disabled for this member (or member not found)." };
    revalidateQrPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}

export async function setQrEnabledAction(id: string, enabled: boolean): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!can(user, "team.manage")) return FORBIDDEN;

  try {
    const [row] = await db
      .update(teamMembers)
      .set({
        qrEnabled: enabled,
        qrGeneratedAt: enabled ? sql`coalesce(${teamMembers.qrGeneratedAt}, now())` : teamMembers.qrGeneratedAt,
        updatedAt: new Date(),
      })
      .where(eq(teamMembers.id, id))
      .returning({ id: teamMembers.id });
    if (!row) return { success: false, error: "Team member not found." };
    revalidateQrPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
