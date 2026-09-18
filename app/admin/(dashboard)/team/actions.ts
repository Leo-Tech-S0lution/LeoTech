"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { teamMembers, type TeamMember } from "@/lib/db/schema";
import { teamMemberSchema } from "@/lib/validation/team";
import { toActionError, type ActionResult } from "@/lib/validation/common";

function revalidateTeamPaths() {
  revalidatePath("/admin/team");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/blog");
}

export async function createTeamMemberAction(input: unknown): Promise<ActionResult<TeamMember>> {
  await requireAdmin();

  const parsed = teamMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db.insert(teamMembers).values(parsed.data).returning();
    if (!row) return { success: false, error: "Could not create team member." };
    revalidateTeamPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateTeamMemberAction(id: string, input: unknown): Promise<ActionResult<TeamMember>> {
  await requireAdmin();

  const parsed = teamMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const [row] = await db
      .update(teamMembers)
      .set(parsed.data)
      .where(eq(teamMembers.id, id))
      .returning();
    if (!row) return { success: false, error: "Team member not found." };
    revalidateTeamPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteTeamMemberAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning();
    revalidateTeamPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
