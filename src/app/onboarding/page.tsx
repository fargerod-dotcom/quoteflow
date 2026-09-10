import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { TRADES, TRIAL_DAYS } from "@/lib/constants";
import { countryOf, DEFAULT_COUNTRY } from "@/lib/countries";

export default function OnboardingPage() {
  // No country selector at launch: every plumber in the first hundred is
  // Norwegian, and a dropdown on step 1 costs conversion. The hidden field is
  // what a <Select> will replace in month 4 — everything else already reads
  // from the registry.
  const c = countryOf(DEFAULT_COUNTRY);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="px-6 py-5">
        <Logo />
      </header>
      <div className="mx-auto max-w-lg px-4 pb-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step 1 of 2</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Set up your business</h1>
        <p className="mt-2 text-sm text-slate-600">
          Two minutes. The AI uses your rates to draft every quote, and you get your public link right after.
        </p>

        <OnboardingForm className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <input type="hidden" name="country" value={c.code} />

          <div>
            <Label htmlFor="name">Business name</Label>
            <Input id="name" name="name" required placeholder="Joe's Plumbing" autoComplete="organization" />
            <p className="mt-1 text-xs text-slate-500">Customers see this on your quote page.</p>
          </div>

          <div>
            <Label htmlFor="trade">Trade</Label>
            <Select id="trade" name="trade" required defaultValue="PLUMBING">
              {TRADES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="serviceArea">Service area</Label>
            <Textarea id="serviceArea" name="serviceArea" rows={2} placeholder="e.g. Within 20 miles of Springfield" />
          </div>

          <div>
            <Label htmlFor="ownerPhone">Your mobile number</Label>
            <Input
              id="ownerPhone"
              name="ownerPhone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder={c.phone.exampleNational}
            />
            <p className="mt-1 text-xs text-slate-500">
              We text you here the moment a request comes in. Norwegian mobile numbers only for now (8 digits).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourlyRate">Hourly rate ({c.currency} excl. {c.tax.labelInline})</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                required
                defaultValue={c.defaults.hourlyRate}
              />
            </div>
            <div>
              <Label htmlFor="calloutFee">Call-out fee ({c.currency} excl. {c.tax.labelInline})</Label>
              <Input
                id="calloutFee"
                name="calloutFee"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                required
                defaultValue={c.defaults.calloutFee}
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-slate-500">
            Pre-filled with typical rates for {c.name}. {c.tax.label} ({c.tax.defaultRate}%) is added on top of every
            quote. You can change these any time in Settings.
          </p>

          <Button type="submit" size="lg" className="mt-1">
            Continue to free trial →
          </Button>
          <p className="text-center text-xs text-slate-500">
            Next: add a card to start your {TRIAL_DAYS}-day trial. You won&rsquo;t be charged until it ends.
          </p>
        </OnboardingForm>
      </div>
    </div>
  );
}
