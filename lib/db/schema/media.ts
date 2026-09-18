import {
  pgTable,
  uuid,
  text,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { adminUsers } from "./auth";

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: varchar("filename", { length: 255 }).notNull(),
  url: text("url").notNull(),
  // Storage provider's own asset id (e.g. a Cloudinary public_id), used to
  // delete the remote asset reliably. Null for anything stored before this
  // column existed, or if a future provider has no separate id concept.
  externalId: varchar("external_id", { length: 255 }),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(), // bytes
  width: integer("width"),
  height: integer("height"),
  altText: varchar("alt_text", { length: 255 }),
  uploadedBy: uuid("uploaded_by").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
