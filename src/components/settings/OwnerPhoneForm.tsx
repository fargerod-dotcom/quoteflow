"use client";

import { useFormState } from "react-dom";
import { updateOwnerPhone, type OwnerPhoneState } from "@/actions/settings";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { countryOf, type CountryCode } from "@/lib/countries";

/**
 * Client shell around the owner's mobile number so a rejected number renders
 * inline, the way onboarding does it.
 */
export function OwnerPhoneForm({ current, country }: { current: string; country: CountryCode }) {
  const [state, formAction] = useFormState<OwnerPhoneState, FormData>(updateOwnerPhone, { error: null });
  const c = countryOf(country);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      {state.saved && !state.error && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800">Mobile number updated.</p>
      )}
      <div>
        <Label htmlFor="ownerPhone">Owner mobile number</Label>
        <Input
          id="ownerPhone"
          name="ownerPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          defaultValue={current}
          placeholder={c.phone.exampleNational}
        />
        <p className="mt-1 text-xs text-slate-500">
          Every new job request is texted here. It must be a mobile number in {c.name} — landlines can&rsquo;t receive
          our texts.
        </p>
      </div>
      <Button type="submit" className="self-start">
        Save number
      </Button>
    </form>
  );
}
