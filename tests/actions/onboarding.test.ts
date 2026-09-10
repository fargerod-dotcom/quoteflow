import { describe, it, expect, vi, beforeEach } from "vitest";

class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`REDIRECT:${url}`);
  }
}

const { findUnique, create, requireSession, generateUniqueSlug, createCheckoutSession, redirect } = vi.hoisted(
  () => ({
    findUnique: vi.fn(),
    create: vi.fn(),
    requireSession: vi.fn(),
    generateUniqueSlug: vi.fn(),
    createCheckoutSession: vi.fn(),
    redirect: vi.fn((url: string) => {
      throw new RedirectSignal(url);
    }),
  })
);

vi.mock("@/lib/prisma", () => ({ prisma: { business: { findUnique, create } } }));
vi.mock("@/lib/auth-helpers", () => ({ requireSession }));
vi.mock("@/lib/slug", () => ({ generateUniqueSlug }));
vi.mock("@/lib/billing/stripe", () => ({ createCheckoutSession }));
vi.mock("next/navigation", () => ({ redirect }));

import { createBusiness } from "@/actions/onboarding";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const VALID_FIELDS = {
  name: "Joe's Plumbing",
  trade: "PLUMBING",
  serviceArea: "Springfield",
  ownerPhone: "980 53 546",
  hourlyRate: "95",
  calloutFee: "49",
};

beforeEach(() => {
  vi.clearAllMocks();
  requireSession.mockResolvedValue({ user: { id: "user-1", email: "owner@example.com" } });
  generateUniqueSlug.mockResolvedValue("joes-plumbing");
  findUnique.mockResolvedValue(null);
  create.mockImplementation(async ({ data }: any) => ({ id: "biz-1", ...data }));
});

describe("createBusiness", () => {
  it("throws when name or phone is missing", async () => {
    await expect(createBusiness(formData({ ...VALID_FIELDS, name: "" }))).rejects.toThrow(
      /required/i
    );
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects an owner phone that isn't a Norwegian mobile", async () => {
    await expect(createBusiness(formData({ ...VALID_FIELDS, ownerPhone: "5551234567" }))).rejects.toThrow(
      /Norwegian mobile number/
    );
    await expect(createBusiness(formData({ ...VALID_FIELDS, ownerPhone: "22 33 44 55" }))).rejects.toThrow(
      /Norwegian mobile number/
    );
    expect(create).not.toHaveBeenCalled();
  });

  it("redirects to the dashboard without creating a duplicate business for an existing owner", async () => {
    findUnique.mockResolvedValue({ id: "existing-biz" });

    await expect(createBusiness(formData(VALID_FIELDS))).rejects.toThrow(RedirectSignal);
    expect(create).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/dashboard/inbox");
  });

  it("creates the business with a ~14-day trial and redirects to Stripe Checkout when available", async () => {
    createCheckoutSession.mockResolvedValue({ url: "https://checkout.stripe.com/session/abc" });

    await expect(createBusiness(formData(VALID_FIELDS))).rejects.toThrow(RedirectSignal);

    expect(create).toHaveBeenCalledTimes(1);
    const created = create.mock.calls[0][0].data;
    expect(created.name).toBe("Joe's Plumbing");
    expect(created.slug).toBe("joes-plumbing");
    // Stored normalised so SMS policy and Twilio both get E.164.
    expect(created.ownerPhone).toBe("+4798053546");
    expect(created.hourlyRate).toBe(95);
    expect(created.calloutFee).toBe(49);

    const trialMs = created.trialEndsAt.getTime() - Date.now();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    expect(Math.abs(trialMs - fourteenDaysMs)).toBeLessThan(5000);

    expect(redirect).toHaveBeenCalledWith("https://checkout.stripe.com/session/abc");
  });

  it("falls back to the dashboard when Checkout is unavailable (no Stripe configured)", async () => {
    createCheckoutSession.mockResolvedValue(null);

    await expect(createBusiness(formData(VALID_FIELDS))).rejects.toThrow(RedirectSignal);
    expect(redirect).toHaveBeenCalledWith("/dashboard/inbox");
  });
});
