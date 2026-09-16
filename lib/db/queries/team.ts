import "server-only";
import { db } from "@/lib/db";
import { teamMembers, type TeamMember } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  return db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.published, true))
    .orderBy(asc(teamMembers.order));
}

export async function getAllTeamMembersAdmin(): Promise<TeamMember[]> {
  return db.select().from(teamMembers).orderBy(asc(teamMembers.order));
}
