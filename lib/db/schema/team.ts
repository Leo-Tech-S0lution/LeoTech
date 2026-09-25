import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  boolean,
  jsonb,
  timestamp,
  date,
  index,
} from "drizzle-orm/pg-core";
import { employmentTypeEnum } from "./enums";

export interface ExperienceEntry {
  role: string;
  organization: string;
  period?: string;
  description?: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  period?: string;
  description?: string;
}

export interface ProjectEntry {
  name: string;
  description?: string;
  url?: string;
}

export interface CertificationEntry {
  name: string;
  issuer?: string;
  year?: string;
  url?: string;
}

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Full display name. Composed from first/middle/last when those are set. */
  name: varchar("name", { length: 160 }).notNull(),
  firstName: varchar("first_name", { length: 60 }),
  middleName: varchar("middle_name", { length: 60 }),
  lastName: varchar("last_name", { length: 60 }),
  /** Public profile route: /team/{slug}. Printed QR codes point here, so changes are recorded in team_member_slug_history. */
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  employeeId: varchar("employee_id", { length: 40 }).unique(),
  position: varchar("position", { length: 160 }),
  department: varchar("department", { length: 120 }),
  joiningDate: date("joining_date"),
  employmentType: employmentTypeEnum("employment_type"),
  /** Short bio — shown on team cards and the profile header. */
  bio: text("bio"),
  /** Long-form biography for the profile "About" section. */
  biography: text("biography"),
  image: text("image"),
  coverImage: text("cover_image"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 40 }),
  whatsapp: varchar("whatsapp", { length: 40 }),
  location: varchar("location", { length: 160 }),
  skills: jsonb("skills").$type<string[]>().default([]),
  experience: jsonb("experience").$type<ExperienceEntry[]>().default([]),
  education: jsonb("education").$type<EducationEntry[]>().default([]),
  projects: jsonb("projects").$type<ProjectEntry[]>().default([]),
  certifications: jsonb("certifications").$type<CertificationEntry[]>().default([]),
  socialLinks: jsonb("social_links")
    .$type<{ label: string; url: string }[]>()
    .default([]),
  order: integer("order").notNull().default(0),
  /** Listed publicly: shown in the team directory, homepage, sitemap and indexable by search engines. */
  published: boolean("published").notNull().default(true),
  /** Inactive members' profiles are withdrawn entirely (QR scans show "Profile Unavailable"). */
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  qrEnabled: boolean("qr_enabled").notNull().default(true),
  /** When the current QR artwork was generated. Null = not generated yet. */
  qrGeneratedAt: timestamp("qr_generated_at", { withTimezone: true }),
  /** Bumped on "Regenerate QR" so downloaded files are distinguishable; the encoded URL never changes. */
  qrVersion: integer("qr_version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Every slug a member has ever had. Old slugs keep redirecting to the member's
 * current profile so already-printed ID-card QR codes never break.
 */
export const teamMemberSlugHistory = pgTable(
  "team_member_slug_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamMemberId: uuid("team_member_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    isCurrent: boolean("is_current").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("slug_history_member_idx").on(t.teamMemberId)],
);

/** Anonymous profile-view log. Stores coarse device info only — no IP, no full user agent. */
export const profileViews = pgTable(
  "profile_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamMemberId: uuid("team_member_id")
      .notNull()
      .references(() => teamMembers.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
    deviceType: varchar("device_type", { length: 20 }),
    browser: varchar("browser", { length: 40 }),
    os: varchar("os", { length: 40 }),
    /** Referrer hostname only (never the full URL). */
    referrer: varchar("referrer", { length: 255 }),
  },
  (t) => [index("profile_views_member_time_idx").on(t.teamMemberId, t.viewedAt)],
);

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type TeamMemberSlugHistory = typeof teamMemberSlugHistory.$inferSelect;
export type ProfileView = typeof profileViews.$inferSelect;
