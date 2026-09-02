import { prisma } from "@/lib/prisma";

/**
 * Records a non-fatal failure (missing API key, SDK error, parse failure, ...)
 * so the admin /admin/errors view can surface it. Never throws itself —
 * callers rely on this being safe to call from inside catch blocks.
 */
export async function logError(
  source: string,
  message: string,
  meta?: Record<string, unknown>
): Promise<void> {
  console.error(`[${source}] ${message}`, meta ?? "");
  try {
    await prisma.errorLog.create({
      data: {
        source,
        message,
        meta: meta ? JSON.parse(JSON.stringify(meta)) : undefined,
      },
    });
  } catch (err) {
    // Logging must never itself throw and break the calling flow.
    console.error("[errors] failed to write ErrorLog row", err);
  }
}
