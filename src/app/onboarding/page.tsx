import { createBusiness } from "@/actions/onboarding";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { TRADES, TRIAL_DAYS } from "@/lib/constants";

export default function OnboardingPage() {
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

        <form action={createBusiness} className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
              placeholder="(555) 123-4567"
            />
            <p className="mt-1 text-xs text-slate-500">
              We text you here the moment a request comes in. Norwegian numbers can be entered as 8 digits; otherwise start with your country code.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourlyRate">Hourly rate (kr)</Label>
              <Input id="hourlyRate" name="hourlyRate" type="number" min="0" step="0.01" inputMode="decimal" required placeholder="950" />
            </div>
            <div>
              <Label htmlFor="calloutFee">Call-out fee (kr)</Label>
              <Input id="calloutFee" name="calloutFee" type="number" min="0" step="0.01" inputMode="decimal" required placeholder="500" />
            </div>
          </div>
          <p className="-mt-2 text-xs text-slate-500">You can change these any time in Settings.</p>

          <Button type="submit" size="lg" className="mt-1">
            Continue to free trial →
          </Button>
          <p className="text-center text-xs text-slate-500">
            Next: add a card to start your {TRIAL_DAYS}-day trial. You won&rsquo;t be charged until it ends.
          </p>
        </form>
      </div>
    </div>
  );
}
