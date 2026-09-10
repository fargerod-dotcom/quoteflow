"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { acceptQuote, declineQuote } from "@/actions/public-quote";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/countries";

function Pending({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <>{pending ? t("quote.pending", lang) : children}</>;
}

export function QuoteActions({ lang }: { lang: Lang }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-3">
      <Button type="submit" formAction={acceptQuote} size="lg" disabled={pending} className="w-full">
        <Pending lang={lang}>{t("quote.accept", lang)}</Pending>
      </Button>
      <button
        type="submit"
        formAction={declineQuote}
        disabled={pending}
        onClick={(e) => {
          if (!window.confirm(t("quote.declineConfirm", lang))) e.preventDefault();
        }}
        className="py-2 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50"
      >
        {t("quote.decline", lang)}
      </button>
    </div>
  );
}
