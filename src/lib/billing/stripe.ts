import Stripe from "stripe";
import type { Business } from "@prisma/client";
import { logError } from "@/lib/errors";

let cachedClient: Stripe | null = null;

function getStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!cachedClient) {
    cachedClient = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
  }
  return cachedClient;
}

export type CreateCheckoutSessionInput = {
  business: Pick<Business, "id" | "name" | "stripeCustomerId">;
  ownerEmail: string;
};

/**
 * Creates a Stripe Checkout session for the $49/mo subscription with a
 * 14-day trial. Returns null (rather than throwing) if Stripe isn't
 * configured — onboarding treats that as "stay on trial, skip Checkout".
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<{ url: string } | null> {
  const stripe = getStripeClient();
  if (!stripe || !process.env.STRIPE_PRICE_ID) {
    console.log(`[stripe:fallback] skipping Checkout for business=${input.business.id} (no Stripe key configured)`);
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: input.business.stripeCustomerId ?? undefined,
      customer_email: input.business.stripeCustomerId ? undefined : input.ownerEmail,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      subscription_data: { trial_period_days: 14 },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inbox?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=canceled`,
      client_reference_id: input.business.id,
      metadata: { businessId: input.business.id },
    });
    return session.url ? { url: session.url } : null;
  } catch (err) {
    await logError("billing.stripe", err instanceof Error ? err.message : "Unknown Stripe error", {
      businessId: input.business.id,
    });
    return null;
  }
}

export function getStripeWebhookClient(): Stripe | null {
  return getStripeClient();
}

/**
 * True if the business currently has dashboard access: still within its
 * trial window, or an active paid subscription. Used by the dashboard
 * billing gate, not a hard paywall on the public intake/quote pages.
 */
export function isBusinessActive(business: Pick<Business, "subscriptionStatus" | "trialEndsAt">): boolean {
  if (business.subscriptionStatus === "ACTIVE") return true;
  if (business.subscriptionStatus === "TRIALING") return business.trialEndsAt.getTime() > Date.now();
  return false;
}
