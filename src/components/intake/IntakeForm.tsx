"use client";

import { useFormStatus } from "react-dom";
import { createRequest } from "@/actions/requests";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { PhotoUploader } from "@/components/intake/PhotoUploader";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-2">
      {pending ? "Submitting…" : "Send request"}
    </Button>
  );
}

export function IntakeForm({ slug }: { slug: string }) {
  return (
    <form action={createRequest} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />

      <div>
        <Label htmlFor="description">Describe the job</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="e.g. Kitchen faucet is leaking under the sink, been dripping for a week."
        />
      </div>

      <div>
        <Label>Photos (optional, up to 5)</Label>
        <PhotoUploader />
      </div>

      <div>
        <Label htmlFor="customerName">Your name</Label>
        <Input id="customerName" name="customerName" required />
      </div>

      <div>
        <Label htmlFor="customerPhone">Phone number</Label>
        <Input id="customerPhone" name="customerPhone" type="tel" required />
      </div>

      <div>
        <Label htmlFor="customerEmail">Email (optional)</Label>
        <Input id="customerEmail" name="customerEmail" type="email" />
      </div>

      <div>
        <Label htmlFor="customerAddress">Job address</Label>
        <Input id="customerAddress" name="customerAddress" required />
      </div>

      <div>
        <Label>Preferred dates (pick 1-3)</Label>
        <div className="grid grid-cols-3 gap-2">
          <Input name="preferredDates" type="date" required />
          <Input name="preferredDates" type="date" />
          <Input name="preferredDates" type="date" />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
