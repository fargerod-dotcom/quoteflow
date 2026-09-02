import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { logError } from "@/lib/errors";

export type UploadPhotoInput = {
  businessId: string;
  filename: string;
  bytes: Buffer;
  contentType: string;
};

/**
 * Uploads a photo to Vercel Blob in production. Without a BLOB_READ_WRITE_TOKEN
 * (local dev), writes to /public/uploads instead so the intake flow works
 * end-to-end without a Blob store configured.
 */
export async function uploadPhoto(input: UploadPhotoInput): Promise<string> {
  const ext = path.extname(input.filename) || ".jpg";
  const key = `${input.businessId}/${randomUUID()}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(key, input.bytes, {
        access: "public",
        contentType: input.contentType,
      });
      return blob.url;
    } catch (err) {
      await logError("storage.blob", err instanceof Error ? err.message : "Unknown Blob error", {
        businessId: input.businessId,
      });
      // Fall through to local storage rather than losing the photo entirely.
    }
  }

  const localDir = path.join(process.cwd(), "public", "uploads", input.businessId);
  await fs.mkdir(localDir, { recursive: true });
  const localPath = path.join(localDir, `${randomUUID()}${ext}`);
  await fs.writeFile(localPath, input.bytes);
  return `/uploads/${input.businessId}/${path.basename(localPath)}`;
}
