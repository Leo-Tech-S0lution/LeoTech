/**
 * Idempotent, production-safe team seed: `npm run db:seed-team`.
 *
 * For each member of the current Leo Tech Solution roster:
 * - if a member with the same slug or the same name (case-insensitive) exists,
 *   only EMPTY fields are filled in (name parts, designation, department) —
 *   nothing that an admin has already entered is overwritten;
 * - otherwise the member is created with a profile slug, slug history and QR.
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, or, sql } from "drizzle-orm";
import { config } from "dotenv";
import slugify from "slugify";
import * as schema from "./schema";

config({ path: ".env.local" });

const ROSTER: {
  firstName: string;
  middleName?: string;
  lastName: string;
  position: string;
  department?: string;
}[] = [
  { firstName: "Deepa", lastName: "Paswan", position: "CEO", department: "Management" },
  { firstName: "Suraj", middleName: "Kumar", lastName: "Sah", position: "Managing Director", department: "Management" },
  { firstName: "Dipesh", middleName: "Kumar", lastName: "Mahato", position: "CTO" },
  { firstName: "Ramabtar", lastName: "Yadav", position: "HR" },
  { firstName: "Raja", middleName: "Kumar", lastName: "Sah", position: "Full-Stack Software Engineer" },
  { firstName: "Rahul", lastName: "Paswan", position: "Robotics Instructor" },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set. Add it to .env.local.");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const { teamMembers, teamMemberSlugHistory } = schema;

  for (const [index, person] of ROSTER.entries()) {
    const name = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ");
    const slug = slugify(name, { lower: true, strict: true, trim: true });

    const [existing] = await db
      .select()
      .from(teamMembers)
      .where(or(eq(teamMembers.slug, slug), sql`lower(${teamMembers.name}) = ${name.toLowerCase()}`))
      .limit(1);

    if (existing) {
      const patch: Partial<typeof teamMembers.$inferInsert> = {};
      if (!existing.firstName) patch.firstName = person.firstName;
      if (!existing.middleName && person.middleName) patch.middleName = person.middleName;
      if (!existing.lastName) patch.lastName = person.lastName;
      if (!existing.position) patch.position = person.position;
      if (!existing.department && person.department) patch.department = person.department;

      if (Object.keys(patch).length > 0) {
        await db.update(teamMembers).set({ ...patch, updatedAt: new Date() }).where(eq(teamMembers.id, existing.id));
        console.log(`~ ${name}: filled ${Object.keys(patch).join(", ")}`);
      } else {
        console.log(`= ${name}: already complete, unchanged`);
      }
      continue;
    }

    const [created] = await db
      .insert(teamMembers)
      .values({ ...person, name, slug, order: index, published: true, qrGeneratedAt: new Date() })
      .returning();
    if (created) {
      await db
        .insert(teamMemberSlugHistory)
        .values({ teamMemberId: created.id, slug, isCurrent: true })
        .onConflictDoNothing();
      console.log(`+ ${name}: created at /team/${slug}`);
    }
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Team seed failed:", err);
  process.exit(1);
});
