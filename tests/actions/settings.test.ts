import { describe, it, expect, vi, beforeEach } from "vitest";

const { update, requireBusiness, revalidatePath } = vi.hoisted(() => ({
  update: vi.fn().mockResolvedValue({}),
  requireBusiness: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { business: { update } } }));
vi.mock("@/lib/auth-helpers", () => ({ requireBusiness }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { updatePrices, updateSmsTemplates, updateOwnerPhone } from "@/actions/settings";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireBusiness.mockResolvedValue({ id: "biz-1", country: "NO" });
});

describe("updatePrices", () => {
  it("clamps the MVA rate to 0–100 and defaults to 25 when missing", async () => {
    await updatePrices(formData({ hourlyRate: "1", calloutFee: "1", vatRate: "150" }));
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ data: expect.objectContaining({ vatRate: 100 }) }));
    await updatePrices(formData({ hourlyRate: "1", calloutFee: "1", vatRate: "0" }));
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ data: expect.objectContaining({ vatRate: 0 }) }));
  });

  it("parses numeric fields and writes them scoped to the caller's business", async () => {
    await updatePrices(formData({ hourlyRate: "99.5", calloutFee: "55", vatRate: "25", serviceArea: "New area" }));

    expect(update).toHaveBeenCalledWith({
      where: { id: "biz-1" },
      data: { hourlyRate: 99.5, calloutFee: 55, vatRate: 25, serviceArea: "New area" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("stores a blank service area as null rather than an empty string", async () => {
    await updatePrices(formData({ hourlyRate: "10", calloutFee: "5", serviceArea: "  " }));

    expect(update).toHaveBeenCalledWith({
      where: { id: "biz-1" },
      data: { hourlyRate: 10, calloutFee: 5, vatRate: 25, serviceArea: null },
    });
  });
});

describe("updateSmsTemplates", () => {
  it("saves all three templates", async () => {
    await updateSmsTemplates(
      formData({
        smsTemplateNewQuote: "New quote: {{link}}",
        smsTemplateFollowUp: "Follow up: {{link}}",
        smsTemplateConfirmation: "Confirmed: {{scheduledDate}}",
      })
    );

    expect(update).toHaveBeenCalledWith({
      where: { id: "biz-1" },
      data: {
        smsTemplateNewQuote: "New quote: {{link}}",
        smsTemplateFollowUp: "Follow up: {{link}}",
        smsTemplateConfirmation: "Confirmed: {{scheduledDate}}",
      },
    });
  });

  it("stores blank templates as null so the built-in default applies", async () => {
    await updateSmsTemplates(formData({ smsTemplateNewQuote: "", smsTemplateFollowUp: "", smsTemplateConfirmation: "" }));

    expect(update).toHaveBeenCalledWith({
      where: { id: "biz-1" },
      data: { smsTemplateNewQuote: null, smsTemplateFollowUp: null, smsTemplateConfirmation: null },
    });
  });
});

describe("updateOwnerPhone", () => {
  it("stores a Norwegian mobile normalised to E.164", async () => {
    const state = await updateOwnerPhone({ error: null }, formData({ ownerPhone: "980 53 546" }));

    expect(state).toEqual({ error: null, saved: true });
    expect(update).toHaveBeenCalledWith({ where: { id: "biz-1" }, data: { ownerPhone: "+4798053546" } });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("refuses a landline or a foreign number without writing", async () => {
    for (const ownerPhone of ["22 33 44 55", "5551234567", "not a number", ""]) {
      const state = await updateOwnerPhone({ error: null }, formData({ ownerPhone }));
      expect(state.error).toMatch(/mobile number in Norge/);
    }
    expect(update).not.toHaveBeenCalled();
  });
});
