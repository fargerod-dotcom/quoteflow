"use server";

import { redirect } from "next/navigation";
import { requireSession, requireBusiness } from "@/lib/auth-helpers";
import { createCheckoutSession } from "@/lib/billing/stripe";

export async function startCheckout(): Promise<void> {
  const session = await requireSession();
  const business = await requireBusiness();

  const checkout = await createCheckoutSession({ business, ownerEmail: session.user.email! });
  redirect(checkout?.url ?? "/dashboard/billing?checkout=unavailable");
}
