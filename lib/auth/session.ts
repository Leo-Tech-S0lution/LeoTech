import "server-only";
import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, adminUsers, type AdminUser } from "@/lib/db/schema";

const SESSION_COOKIE = "leotech_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a new session for the given user and sets the session cookie. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: tokenHash,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/** Reads the session cookie and returns the authenticated admin user, or null. */
export async function getSessionUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);

  const [row] = await db
    .select({ user: adminUsers })
    .from(sessions)
    .innerJoin(adminUsers, eq(sessions.userId, adminUsers.id))
    .where(and(eq(sessions.id, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return row?.user ?? null;
}

/** Destroys the current session (DB row + cookie). */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  }

  cookieStore.delete(SESSION_COOKIE);
}
