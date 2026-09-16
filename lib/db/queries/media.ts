import "server-only";
import { db } from "@/lib/db";
import { media, type Media } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getAllMedia(): Promise<Media[]> {
  return db.select().from(media).orderBy(desc(media.createdAt));
}

export async function getMediaById(id: string): Promise<Media | null> {
  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  return row ?? null;
}
