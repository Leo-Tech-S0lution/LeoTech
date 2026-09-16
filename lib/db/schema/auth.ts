import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { adminRoleEnum } from "./enums";

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRoleEnum("role").notNull().default("editor"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // opaque random token (hashed at rest)
  userId: uuid("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type Session = typeof sessions.$inferSelect;
