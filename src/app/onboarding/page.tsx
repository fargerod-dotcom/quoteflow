import { createBusiness } from "@/actions/onboarding";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { TRADES } from "@/lib/constants";

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Tell us about your business</h1>
      <p className="mt-2 text-sm text-slate-600">
        This takes about 2 minutes. You&rsquo;ll get your public quote-request link right after.
      </p>

      <form action={createBusiness} className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Business name</Label>
          <Input id="name" name="name" required placeholder="Joe's Plumbing" />
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
          <Textarea
            id="serviceArea"
            name="serviceArea"
            rows={2}
            placeholder="e.g. Within 20 miles of Springfield"
          />
        </div>

        <div>
          <Label htmlFor="ownerPhone">Your mobile number</Label>
          <Input
            id="ownerPhone"
            name="ownerPhone"
            type="tel"
            required
            placeholder="(555) 123-4567"
          />
          <p className="mt-1 text-xs text-slate-500">
            We&rsquo;ll text you here when a new job request comes in.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hourlyRate">Hourly rate ($)</Label>
            <Input id="hourlyRate" name="hourlyRate" type="number" min="0" step="0.01" required />
          </div>
          <div>
            <Label htmlFor="calloutFee">Call-out fee ($)</Label>
            <Input id="calloutFee" name="calloutFee" type="number" min="0" step="0.01" required />
          </div>
        </div>

        <Button type="submit" className="mt-2">
          Continue
        </Button>
      </form>
    </div>
  );
}
