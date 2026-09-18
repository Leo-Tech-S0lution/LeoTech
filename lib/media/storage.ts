import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

/**
 * Cloudinary-backed media storage. This is the single integration point for
 * uploads — swap the body of `saveUploadedFile` / `deleteStoredFile` again
 * (e.g. for S3) without touching any calling code.
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface StoredFile {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  /** Cloudinary public_id — needed to delete the asset later. */
  externalId: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function saveUploadedFile(file: File): Promise<StoredFile> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File exceeds the 10MB upload limit.");
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "leotech-solution",
        resource_type: "image",
        // SVGs are uploaded as image assets too — Cloudinary accounts have
        // SVG delivery disabled by default (XSS risk from embedded scripts);
        // enable "Allow delivery of SVG" under Settings > Security if you
        // need to serve uploaded SVGs.
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Cloudinary upload failed."));
        } else {
          resolve(uploadResult);
        }
      },
    );
    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    filename: file.name || `${result.public_id}.${result.format}`,
    mimeType: file.type,
    size: result.bytes,
    width: result.width ?? null,
    height: result.height ?? null,
    externalId: result.public_id,
  };
}

export async function deleteStoredFile(externalId: string | null | undefined): Promise<void> {
  if (!externalId) return; // nothing to do for pre-Cloudinary/local records
  await cloudinary.uploader.destroy(externalId, { resource_type: "image" }).catch(() => {
    // Already gone, or transient error — treat as success rather than
    // blocking the admin from removing the database record.
  });
}
