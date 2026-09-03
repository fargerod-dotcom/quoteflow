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

/** Public path prefix that the authenticated photo proxy route serves from. */
export const PHOTO_ROUTE_PREFIX = "/api/photos/";

/**
 * Uploads a photo to Vercel Blob (as a *private* blob) in production and
 * returns a URL on our own /api/photos route, which checks the viewer owns the
 * business before streaming the image. Without a BLOB_READ_WRITE_TOKEN (local
 * dev), writes to /public/uploads instead so the intake flow works end-to-end.
 */
export async function uploadPhoto(input: UploadPhotoInput): Promise<string> {
  const ext = path.extname(input.filename) || ".jpg";
  const key = `${input.businessId}/${randomUUID()}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(key, input.bytes, {
        access: "private",
        contentType: input.contentType,
        addRandomSuffix: false,
      });
      return `${PHOTO_ROUTE_PREFIX}${blob.pathname}`;
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

/** Streams a private blob by its pathname (e.g. "<businessId>/<uuid>.jpg"). */
export async function readPhoto(pathname: string) {
  const { get } = await import("@vercel/blob");
  return get(pathname, { access: "private" });
}
