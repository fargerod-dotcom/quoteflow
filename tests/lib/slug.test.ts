import { describe, it, expect, vi, beforeEach } from "vitest";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { business: { findUnique } },
}));

import { slugify, generateUniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases, strips apostrophes, and hyphenates spaces", () => {
    expect(slugify("Joe's Plumbing")).toBe("joes-plumbing");
  });

  it("collapses duplicate and leading/trailing hyphens", () => {
    expect(slugify("  --Ace   Electric--  ")).toBe("ace-electric");
  });

  it("falls back to a generated id for an empty/whitespace-only name", () => {
    const result = slugify("   ");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/^business-\d+$/);
  });
});

describe("generateUniqueSlug", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("returns the base slug when there is no collision", async () => {
    findUnique.mockResolvedValueOnce(null);
    const slug = await generateUniqueSlug("Joe's Plumbing");
    expect(slug).toBe("joes-plumbing");
  });

  it("appends -2, then -3 on repeated collisions", async () => {
    findUnique
      .mockResolvedValueOnce({ id: "existing-1" }) // "joes-plumbing" taken
      .mockResolvedValueOnce({ id: "existing-2" }) // "joes-plumbing-2" taken
      .mockResolvedValueOnce(null); // "joes-plumbing-3" free

    const slug = await generateUniqueSlug("Joe's Plumbing");
    expect(slug).toBe("joes-plumbing-3");
    expect(findUnique).toHaveBeenCalledTimes(3);
  });
});
