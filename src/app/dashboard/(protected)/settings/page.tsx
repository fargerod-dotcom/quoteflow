import Link from "next/link";
import { requireBusiness } from "@/lib/auth-helpers";
import { updatePrices, updateSmsTemplates } from "@/actions/settings";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ShareLinkCard } from "@/components/request/ShareLinkCard";
import {
  DEFAULT_SMS_TEMPLATE_NEW_QUOTE,
  DEFAULT_SMS_TEMPLATE_FOLLOW_UP,
  DEFAULT_SMS_TEMPLATE_CONFIRMATION,
} from "@/lib/constants";

export default async function SettingsPage() {
  const business = await requireBusiness();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>

      <ShareLinkCard url={`${process.env.NEXT_PUBLIC_APP_URL}/r/${business.slug}`} />

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Pricing & service area</h2>
        <form action={updatePrices} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourlyRate">Hourly rate (kr)</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                defaultValue={Number(business.hourlyRate)}
                required
              />
            </div>
            <div>
              <Label htmlFor="calloutFee">Call-out fee (kr)</Label>
              <Input
                id="calloutFee"
                name="calloutFee"
                type="number"
                min="0"
                step="0.01"
                defaultValue={Number(business.calloutFee)}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="vatRate">MVA (%)</Label>
            <Input
              id="vatRate"
              name="vatRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              inputMode="decimal"
              defaultValue={Number(business.vatRate)}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Your rates and line items are ex-MVA; this is added on top of every quote. Set 0 if you&rsquo;re not MVA-registered.
            </p>
          </div>
          <div>
            <Label htmlFor="serviceArea">Service area</Label>
            <Textarea id="serviceArea" name="serviceArea" rows={2} defaultValue={business.serviceArea ?? ""} />
          </div>
          <Button type="submit" className="self-start">
            Save pricing
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">SMS templates</h2>
        <p className="mb-3 text-xs text-slate-500">
          Use {"{{customerName}}"}, {"{{businessName}}"}, {"{{total}}"}, {"{{link}}"}, {"{{scheduledDate}}"} as placeholders.
        </p>
        <form action={updateSmsTemplates} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="smsTemplateNewQuote">New quote SMS</Label>
            <Textarea
              id="smsTemplateNewQuote"
              name="smsTemplateNewQuote"
              rows={2}
              defaultValue={business.smsTemplateNewQuote ?? DEFAULT_SMS_TEMPLATE_NEW_QUOTE}
            />
          </div>
          <div>
            <Label htmlFor="smsTemplateFollowUp">Follow-up SMS (sent after 48h)</Label>
            <Textarea
              id="smsTemplateFollowUp"
              name="smsTemplateFollowUp"
              rows={2}
              defaultValue={business.smsTemplateFollowUp ?? DEFAULT_SMS_TEMPLATE_FOLLOW_UP}
            />
          </div>
          <div>
            <Label htmlFor="smsTemplateConfirmation">Booking confirmation SMS</Label>
            <Textarea
              id="smsTemplateConfirmation"
              name="smsTemplateConfirmation"
              rows={2}
              defaultValue={business.smsTemplateConfirmation ?? DEFAULT_SMS_TEMPLATE_CONFIRMATION}
            />
          </div>
          <Button type="submit" className="self-start">
            Save templates
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-500">Billing</h2>
        <p className="mb-3 text-sm text-slate-600">Manage your subscription and payment method.</p>
        <Link href="/dashboard/billing" className="text-sm font-medium text-brand-600 hover:underline">
          Go to billing →
        </Link>
      </Card>
    </div>
  );
}
