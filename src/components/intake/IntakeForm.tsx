"use client";

import { useFormStatus } from "react-dom";
import { createRequest } from "@/actions/requests";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { PhotoUploader } from "@/components/intake/PhotoUploader";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Sending your request…
        </>
      ) : (
        "Send request"
      )}
    </Button>
  );
}

function SectionHeading({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
        {n}
      </span>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {hint && <p className="text-sm text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function IntakeForm({ slug, businessName }: { slug: string; businessName: string }) {
  const min = todayIso();

  return (
    <form action={createRequest} className="flex flex-col gap-8">
      <input type="hidden" name="slug" value={slug} />

      <section>
        <SectionHeading n={1} title="What needs doing?" hint="The more detail, the more accurate the quote." />
        <Textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="e.g. Kitchen faucet is leaking under the sink — been dripping for a week. Cabinet floor is getting wet."
        />
        <div className="mt-4">
          <Label>Photos (optional, up to 5)</Label>
          <PhotoUploader />
        </div>
      </section>

      <section>
        <SectionHeading n={2} title="Where and who" />
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="customerAddress">Job address</Label>
            <Input
              id="customerAddress"
              name="customerAddress"
              required
              autoComplete="street-address"
              placeholder="123 Main St, Springfield"
            />
          </div>
          <div>
            <Label htmlFor="customerName">Your name</Label>
            <Input id="customerName" name="customerName" required autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="customerPhone">Mobile number</Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder="(555) 123-4567"
            />
            <p className="mt-1 text-xs text-slate-500">We&rsquo;ll text your quote here.</p>
          </div>
          <div>
            <Label htmlFor="customerEmail">Email (optional)</Label>
            <Input id="customerEmail" name="customerEmail" type="email" autoComplete="email" inputMode="email" />
          </div>
        </div>
      </section>

      <section>
        <SectionHeading n={3} title="When works for you?" hint="Pick up to three dates — you'll confirm one when you accept the quote." />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input name="preferredDates" type="date" min={min} required aria-label="First preferred date" />
          <Input name="preferredDates" type="date" min={min} aria-label="Second preferred date" />
          <Input name="preferredDates" type="date" min={min} aria-label="Third preferred date" />
        </div>
      </section>

      <div>
        <SubmitButton />
        <p className="mt-3 text-center text-xs text-slate-500">
          {businessName} will review your request and text you a quote. No commitment until you accept.
        </p>
      </div>
    </form>
  );
}
