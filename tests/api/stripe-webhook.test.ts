import { describe, it, expect, vi, beforeEach } from "vitest";
import Stripe from "stripe";

process.env.STRIPE_SECRET_KEY = "sk_test_dummy_for_tests";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_dummy_for_tests";

const { update, findUnique, logError } = vi.hoisted(() => ({
  update: vi.fn().mockResolvedValue({}),
  findUnique: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { business: { update, findUnique } } }));
vi.mock("@/lib/errors", () => ({ logError }));

import { POST } from "@/app/api/stripe/webhook/route";

function signedRequest(payload: object) {
  const body = JSON.stringify(payload);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": signature },
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Stripe webhook route", () => {
  it("rejects a request with an invalid signature", async () => {
    const res = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: { "content-type": "application/json", "stripe-signature": "t=1,v1=deadbeef" },
        body: JSON.stringify({ type: "checkout.session.completed" }),
      })
    );
    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalled();
  });

  it("activates the business on checkout.session.completed", async () => {
    const res = await POST(
      signedRequest({
        id: "evt_1",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_1",
            client_reference_id: "biz-1",
            customer: "cus_1",
            subscription: "sub_1",
          },
        },
      })
    );

    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      where: { id: "biz-1" },
      data: { stripeCustomerId: "cus_1", stripeSubscriptionId: "sub_1", subscriptionStatus: "ACTIVE" },
    });
  });

  it("maps subscription status changes onto the matching business", async () => {
    findUnique.mockResolvedValue({ id: "biz-2" });

    const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const res = await POST(
      signedRequest({
        id: "evt_2",
        type: "customer.subscription.updated",
        data: {
          object: { id: "sub_2", customer: "cus_2", status: "past_due", current_period_end: periodEnd },
        },
      })
    );

    expect(res.status).toBe(200);
    expect(findUnique).toHaveBeenCalledWith({ where: { stripeCustomerId: "cus_2" } });
    expect(update).toHaveBeenCalledWith({
      where: { id: "biz-2" },
      data: { subscriptionStatus: "PAST_DUE", currentPeriodEnd: new Date(periodEnd * 1000) },
    });
  });

  it("does nothing when no business matches the subscription's customer id", async () => {
    findUnique.mockResolvedValue(null);

    const res = await POST(
      signedRequest({
        id: "evt_3",
        type: "customer.subscription.deleted",
        data: {
          object: { id: "sub_3", customer: "cus_missing", status: "canceled", current_period_end: 0 },
        },
      })
    );

    expect(res.status).toBe(200);
    expect(update).not.toHaveBeenCalled();
  });
});
