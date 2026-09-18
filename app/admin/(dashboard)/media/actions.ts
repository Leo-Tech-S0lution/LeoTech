"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { media, type Media } from "@/lib/db/schema";
import { saveUploadedFile, deleteStoredFile } from "@/lib/media/storage";
import { getAllMedia } from "@/lib/db/queries/media";
import { toActionError, type ActionResult } from "@/lib/validation/common";

export async function listMediaAction(): Promise<Media[]> {
  await requireAdmin();
  return getAllMedia();
}

export async function uploadMediaAction(formData: FormData): Promise<ActionResult<Media>> {
  const user = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No file selected." };
  }

  try {
    const stored = await saveUploadedFile(file);
    const [row] = await db
      .insert(media)
      .values({
        filename: stored.filename,
        url: stored.url,
        mimeType: stored.mimeType,
        size: stored.size,
        width: stored.width,
        height: stored.height,
        uploadedBy: user.id,
      })
      .returning();

    revalidatePath("/admin/media");

    if (!row) return { success: false, error: "Upload failed. Please try again." };
    return { success: true, data: row };
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return toActionError(err);
  }
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
    if (!row) return { success: false, error: "Media item not found." };

    await deleteStoredFile(row.url);
    await db.delete(media).where(eq(media.id, id));

    revalidatePath("/admin/media");
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
