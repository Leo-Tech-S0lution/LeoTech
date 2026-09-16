import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  position: varchar("position", { length: 160 }),
  bio: text("bio"),
  image: text("image"),
  skills: jsonb("skills").$type<string[]>().default([]),
  socialLinks: jsonb("social_links")
    .$type<{ label: string; url: string }[]>()
    .default([]),
  order: integer("order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
