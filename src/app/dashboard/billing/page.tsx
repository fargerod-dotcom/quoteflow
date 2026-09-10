import { requireBusiness } from "@/lib/auth-helpers";
import { isBusinessActive } from "@/lib/billing/stripe";
import { startCheckout } from "@/actions/billing";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { countryOf } from "@/lib/countries";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { checkout?: string };
}) {
  const business = await requireBusiness();
  const active = isBusinessActive(business);
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-900">Billing</h1>

      {searchParams.checkout === "unavailable" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Billing isn&rsquo;t fully configured yet — you still have full access on your trial.
        </p>
      )}

      <Card className="mt-4">
        <p className="text-sm text-slate-600">
          Plan: <span className="font-medium text-slate-900">$49/month</span>
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Status: <span className="font-medium text-slate-900">{business.subscriptionStatus}</span>
        </p>
        {business.subscriptionStatus === "TRIALING" && (
          <p className="mt-1 text-sm text-slate-600">
            Trial {active ? "ends" : "ended"} {formatDate(business.trialEndsAt, countryOf(business.country).code)}
          </p>
        )}

        {!active && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            Your trial has ended. Subscribe to keep sending quotes and booking jobs.
          </p>
        )}

        <form action={startCheckout} className="mt-4">
          <Button type="submit" disabled={!stripeConfigured}>
            {active && business.subscriptionStatus === "TRIALING" ? "Add payment method" : "Reactivate subscription"}
          </Button>
        </form>
        {!stripeConfigured && (
          <p className="mt-2 text-xs text-slate-400">Stripe isn&rsquo;t configured in this environment yet.</p>
        )}
      </Card>
    </div>
  );
}
