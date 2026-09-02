"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { acceptQuote, declineQuote } from "@/actions/public-quote";

function Pending({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? "One moment…" : children}</>;
}

export function QuoteActions() {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-3">
      <Button type="submit" formAction={acceptQuote} size="lg" disabled={pending} className="w-full">
        <Pending>Accept &amp; book</Pending>
      </Button>
      <button
        type="submit"
        formAction={declineQuote}
        disabled={pending}
        onClick={(e) => {
          if (!window.confirm("Decline this quote? The business will be notified.")) e.preventDefault();
        }}
        className="py-2 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50"
      >
        No thanks, decline
      </button>
    </div>
  );
}
