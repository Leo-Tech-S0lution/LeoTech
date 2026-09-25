import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import {
  teamMembers,
  teamMemberSlugHistory,
  profileViews,
  type TeamMember,
} from "@/lib/db/schema";
import { and, asc, count, desc, eq, gte, inArray, max, ne, sql } from "drizzle-orm";

/** Members shown in the public directory/homepage: listed + active. */
export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  return db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.published, true), eq(teamMembers.isActive, true)))
    .orderBy(asc(teamMembers.order));
}

export async function getAllTeamMembersAdmin(): Promise<TeamMember[]> {
  return db.select().from(teamMembers).orderBy(asc(teamMembers.order));
}

export async function getTeamMemberByIdAdmin(id: string): Promise<TeamMember | null> {
  const [row] = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return row ?? null;
}

export async function getTeamMembersByIdsAdmin(ids: string[]): Promise<TeamMember[]> {
  if (ids.length === 0) return [];
  return db.select().from(teamMembers).where(inArray(teamMembers.id, ids)).orderBy(asc(teamMembers.order));
}

export type ProfileLookup =
  | { kind: "found"; member: TeamMember }
  | { kind: "redirect"; slug: string }
  | { kind: "missing" };

/**
 * Resolves a public profile slug. Falls back to the slug history so URLs on
 * already-printed QR codes redirect to the member's current slug.
 */
export const resolveProfileSlug = cache(async (slug: string): Promise<ProfileLookup> => {
  const [member] = await db.select().from(teamMembers).where(eq(teamMembers.slug, slug)).limit(1);
  if (member) return { kind: "found", member };

  const [alias] = await db
    .select({ current: teamMembers.slug })
    .from(teamMemberSlugHistory)
    .innerJoin(teamMembers, eq(teamMemberSlugHistory.teamMemberId, teamMembers.id))
    .where(eq(teamMemberSlugHistory.slug, slug))
    .limit(1);
  if (alias && alias.current !== slug) return { kind: "redirect", slug: alias.current };

  return { kind: "missing" };
});

/** True if the slug is the current slug — or a historical alias — of any member other than `excludeId`. */
export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const [current] = await db
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(excludeId ? and(eq(teamMembers.slug, slug), ne(teamMembers.id, excludeId)) : eq(teamMembers.slug, slug))
    .limit(1);
  if (current) return true;

  const [alias] = await db
    .select({ id: teamMemberSlugHistory.id })
    .from(teamMemberSlugHistory)
    .where(
      excludeId
        ? and(eq(teamMemberSlugHistory.slug, slug), ne(teamMemberSlugHistory.teamMemberId, excludeId))
        : eq(teamMemberSlugHistory.slug, slug),
    )
    .limit(1);
  return Boolean(alias);
}

/** Old slugs of a member (for the admin "previous URLs" list). */
export async function getSlugHistoryAdmin(memberId: string) {
  return db
    .select()
    .from(teamMemberSlugHistory)
    .where(and(eq(teamMemberSlugHistory.teamMemberId, memberId), eq(teamMemberSlugHistory.isCurrent, false)))
    .orderBy(desc(teamMemberSlugHistory.createdAt));
}

// ---------- Analytics ----------

export async function recordProfileView(input: {
  teamMemberId: string;
  deviceType: string;
  browser: string;
  os: string;
  referrer: string | null;
}): Promise<void> {
  await db.insert(profileViews).values(input);
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export interface ViewCounts {
  total: number;
  today: number;
  week: number;
  month: number;
}

const countsSelect = () => ({
  total: count(),
  today: sql<number>`count(*) filter (where ${profileViews.viewedAt} >= ${daysAgo(0)})`.mapWith(Number),
  week: sql<number>`count(*) filter (where ${profileViews.viewedAt} >= ${daysAgo(6)})`.mapWith(Number),
  month: sql<number>`count(*) filter (where ${profileViews.viewedAt} >= ${daysAgo(29)})`.mapWith(Number),
});

/** Site-wide profile view totals. */
export async function getProfileViewTotals(): Promise<ViewCounts> {
  const [row] = await db.select(countsSelect()).from(profileViews);
  return row ?? { total: 0, today: 0, week: 0, month: 0 };
}

/** Per-member view totals keyed by member id. */
export async function getProfileViewsByMember(): Promise<Record<string, ViewCounts & { lastViewed: Date | null }>> {
  const rows = await db
    .select({ id: profileViews.teamMemberId, ...countsSelect(), lastViewed: max(profileViews.viewedAt) })
    .from(profileViews)
    .groupBy(profileViews.teamMemberId);
  return Object.fromEntries(rows.map(({ id, ...rest }) => [id, rest]));
}

export interface MemberAnalytics extends ViewCounts {
  lastViewed: Date | null;
  daily: { day: string; views: number }[];
  devices: { label: string; views: number }[];
  browsers: { label: string; views: number }[];
  referrers: { label: string; views: number }[];
}

export async function getMemberAnalytics(memberId: string): Promise<MemberAnalytics> {
  const since = daysAgo(29);
  const byMember = eq(profileViews.teamMemberId, memberId);
  const recent = and(byMember, gte(profileViews.viewedAt, since));

  const breakdown = (
    column: typeof profileViews.deviceType | typeof profileViews.browser | typeof profileViews.referrer,
  ) =>
    db
      .select({ label: sql<string>`coalesce(${column}, 'Unknown')`, views: count() })
      .from(profileViews)
      .where(recent)
      .groupBy(column)
      .orderBy(desc(count()))
      .limit(8);

  const [[totals], [last], dailyRows, devices, browsers, referrers] = await Promise.all([
    db.select(countsSelect()).from(profileViews).where(byMember),
    db.select({ lastViewed: max(profileViews.viewedAt) }).from(profileViews).where(byMember),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${profileViews.viewedAt}), 'YYYY-MM-DD')`,
        views: count(),
      })
      .from(profileViews)
      .where(recent)
      .groupBy(sql`1`),
    breakdown(profileViews.deviceType),
    breakdown(profileViews.browser),
    breakdown(profileViews.referrer),
  ]);

  const byDay = new Map(dailyRows.map((r) => [r.day, r.views]));
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = daysAgo(29 - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { day: key, views: byDay.get(key) ?? 0 };
  });

  return {
    ...(totals ?? { total: 0, today: 0, week: 0, month: 0 }),
    lastViewed: last?.lastViewed ?? null,
    daily,
    devices,
    browsers,
    referrers,
  };
}
