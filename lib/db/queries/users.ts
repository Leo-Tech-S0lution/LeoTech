import "server-only";
import { db } from "@/lib/db";
import { adminUsers, type AdminUser } from "@/lib/db/schema";
import { asc, count, eq } from "drizzle-orm";

export async function getAllAdminUsersAdmin(): Promise<AdminUser[]> {
  return db.select().from(adminUsers).orderBy(asc(adminUsers.name));
}

export async function getAdminUserByIdAdmin(id: string): Promise<AdminUser | null> {
  const [row] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return row ?? null;
}

/** Used by the login action to look up a user by email before verifying the password. */
export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const [row] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  return row ?? null;
}

export async function countOwnerAdmins(): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(adminUsers)
    .where(eq(adminUsers.role, "owner"));
  return row?.value ?? 0;
}
