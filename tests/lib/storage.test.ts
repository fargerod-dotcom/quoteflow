import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

const put = vi.fn();
vi.mock("@vercel/blob", () => ({ put }));
vi.mock("@/lib/errors", () => ({ logError: vi.fn() }));

const cwd = process.cwd();
const tmpRoot = path.join(cwd, "public", "uploads", "__test_business__");

describe("uploadPhoto", () => {
  beforeEach(() => {
    put.mockReset();
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });
  afterEach(async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    await fs.rm(tmpRoot, { recursive: true, force: true });
  });

  it("writes to /public/uploads when no Blob token is configured", async () => {
    const { uploadPhoto } = await import("@/lib/storage/blob");
    const url = await uploadPhoto({
      businessId: "__test_business__",
      filename: "leak.jpg",
      bytes: Buffer.from("abc"),
      contentType: "image/jpeg",
    });
    expect(url).toMatch(/^\/uploads\/__test_business__\/[^/]+\.jpg$/);
    const onDisk = await fs.readFile(path.join(cwd, "public", url));
    expect(onDisk.toString()).toBe("abc");
    expect(put).not.toHaveBeenCalled();
  });

  it("uploads a private blob and returns a proxy URL when a token is present", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test";
    put.mockResolvedValue({ url: "https://blob.example.com/x.jpg", pathname: "__test_business__/x.jpg" });
    const { uploadPhoto } = await import("@/lib/storage/blob");
    const url = await uploadPhoto({
      businessId: "__test_business__",
      filename: "leak.jpg",
      bytes: Buffer.from("abc"),
      contentType: "image/jpeg",
    });
    // Served through our authenticated proxy, never a raw blob URL.
    expect(url).toBe("/api/photos/__test_business__/x.jpg");
    expect(put).toHaveBeenCalledWith(
      expect.stringMatching(/^__test_business__\/.+\.jpg$/),
      expect.any(Buffer),
      { access: "private", contentType: "image/jpeg", addRandomSuffix: false },
    );
  });

  it("falls back to local disk if Blob upload throws", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test";
    put.mockRejectedValue(new Error("boom"));
    const { uploadPhoto } = await import("@/lib/storage/blob");
    const url = await uploadPhoto({
      businessId: "__test_business__",
      filename: "leak.png",
      bytes: Buffer.from("abc"),
      contentType: "image/png",
    });
    expect(url).toMatch(/^\/uploads\/__test_business__\/.+\.png$/);
  });
});
