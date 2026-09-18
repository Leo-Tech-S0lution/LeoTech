"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { adminUsers, type AdminUser } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import {
  createAdminUserSchema,
  updateAdminUserSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { toActionError, type ActionResult } from "@/lib/validation/common";
import { countOwnerAdmins, getAdminUserByIdAdmin } from "@/lib/db/queries/users";

function revalidateUserPaths() {
  revalidatePath("/admin/users");
}

export async function createAdminUserAction(input: unknown): Promise<ActionResult<AdminUser>> {
  await requireAdmin();

  const parsed = createAdminUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const [row] = await db
      .insert(adminUsers)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        passwordHash,
      })
      .returning();
    if (!row) return { success: false, error: "Could not create user." };
    revalidateUserPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "email");
  }
}

export async function updateAdminUserAction(input: unknown): Promise<ActionResult<AdminUser>> {
  await requireAdmin();

  const parsed = updateAdminUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { id, role } = parsed.data;

  try {
    // Guard: don't let the last owner demote themselves (or be demoted) to editor.
    if (role !== "owner") {
      const target = await getAdminUserByIdAdmin(id);
      if (target?.role === "owner") {
        const ownerCount = await countOwnerAdmins();
        if (ownerCount <= 1) {
          return { success: false, error: "Cannot demote the last remaining owner." };
        }
      }
    }

    const [row] = await db
      .update(adminUsers)
      .set({ name: parsed.data.name, email: parsed.data.email, role, updatedAt: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();
    if (!row) return { success: false, error: "User not found." };
    revalidateUserPaths();
    return { success: true, data: row };
  } catch (err) {
    return toActionError(err, "email");
  }
}

export async function resetAdminPasswordAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const [row] = await db
      .update(adminUsers)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(adminUsers.id, parsed.data.id))
      .returning();
    if (!row) return { success: false, error: "User not found." };
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteAdminUserAction(id: string): Promise<ActionResult> {
  const currentUser = await requireAdmin();

  if (currentUser.id === id) {
    return { success: false, error: "You cannot delete your own account." };
  }

  try {
    const target = await getAdminUserByIdAdmin(id);
    if (target?.role === "owner") {
      const ownerCount = await countOwnerAdmins();
      if (ownerCount <= 1) {
        return { success: false, error: "Cannot delete the last remaining owner." };
      }
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));
    revalidateUserPaths();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
