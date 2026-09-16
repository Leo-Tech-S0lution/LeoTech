import "server-only";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import sharp from "sharp";

/**
 * Local-disk media storage. Files land in /public/uploads and are served
 * directly by Next.js as static assets.
 *
 * This is the single integration point for storage: swap the body of
 * `saveUploadedFile` / `deleteStoredFile` for an S3 / Vercel Blob / Cloudinary
 * client to move to external storage without touching any calling code.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export interface StoredFile {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

export async function saveUploadedFile(file: File): Promise<StoredFile> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds the 10MB upload limit.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name).toLowerCase() || guessExt(file.type);
  const safeName = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const destination = path.join(UPLOAD_DIR, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(destination, buffer);

  let width: number | null = null;
  let height: number | null = null;
  if (file.type !== "image/svg+xml") {
    try {
      const meta = await sharp(buffer).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    } catch {
      // Non-fatal: dimension probing failed, still keep the file.
    }
  }

  return {
    url: `/uploads/${safeName}`,
    filename: safeName,
    mimeType: file.type,
    size: file.size,
    width,
    height,
  };
}

export async function deleteStoredFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return; // never touch files outside our managed dir
  const filePath = path.join(process.cwd(), "public", url);
  await unlink(filePath).catch(() => {
    // Already gone — treat as success.
  });
}

function guessExt(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/svg+xml":
      return ".svg";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}
