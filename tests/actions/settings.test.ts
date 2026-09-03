import { describe, it, expect, vi, beforeEach } from "vitest";

const { update, requireBusiness, revalidatePath } = vi.hoisted(() => ({
  update: vi.fn().mockResolvedValue({}),
  requireBusiness: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { business: { update } } }));
vi.mock("@/lib/auth-helpers", () => ({ requireBusiness }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { updatePrices, updateSmsTemplates } from "@/actions/settings";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  requireBusiness.mockResolvedValue({ id: "biz-1" });
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
