import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

config({ path: ".env.local" });

/**
 * Creates the owner admin from ADMIN_EMAIL / ADMIN_PASSWORD, or resets that
 * user's password if the email already exists. Run manually with
 * `npm run admin:reset` — the app itself never reads these variables.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local.");
  }
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await db.query.adminUsers.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });

  if (existing) {
    await db
      .update(schema.adminUsers)
      .set({ passwordHash, role: "owner", updatedAt: new Date() })
      .where(eq(schema.adminUsers.id, existing.id));
    // Sign out any existing sessions so the old password stops working everywhere.
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, existing.id));
    console.log(`✓ Password reset for ${email} (role: owner). Existing sessions signed out.`);
  } else {
    await db.insert(schema.adminUsers).values({
      name: "LeoTech Owner",
      email,
      passwordHash,
      role: "owner",
    });
    console.log(`✓ Owner admin created: ${email}`);
  }

  console.log("  Log in at /admin/login, then remove ADMIN_PASSWORD from .env.local.");
  await pool.end();
}

main().catch((err) => {
  console.error("Admin reset failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
