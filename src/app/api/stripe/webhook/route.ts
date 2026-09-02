import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeWebhookClient } from "@/lib/billing/stripe";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/errors";
import type { SubscriptionStatus } from "@prisma/client";

const STATUS_MAP: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  trialing: "TRIALING",
  active: "ACTIVE",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "INCOMPLETE",
  incomplete_expired: "CANCELED",
  unpaid: "PAST_DUE",
  paused: "CANCELED",
};

export async function POST(request: Request) {
  const stripe = getStripeWebhookClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", webhookSecret);
  } catch (err) {
    await logError("stripe.webhook", "Signature verification failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.client_reference_id ?? session.metadata?.businessId;
        if (businessId) {
          await prisma.business.update({
            where: { id: businessId },
            data: {
              stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
              stripeSubscriptionId:
                typeof session.subscription === "string" ? session.subscription : undefined,
              subscriptionStatus: "ACTIVE",
            },
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const business = await prisma.business.findUnique({
          where: { stripeCustomerId: subscription.customer as string },
        });
        if (business) {
          await prisma.business.update({
            where: { id: business.id },
            data: {
              subscriptionStatus: STATUS_MAP[subscription.status] ?? "INCOMPLETE",
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    await logError("stripe.webhook", err instanceof Error ? err.message : "Unknown webhook handling error", {
      eventType: event.type,
    });
  }

  return NextResponse.json({ received: true });
}
