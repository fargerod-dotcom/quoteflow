import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

export function ShareLinkCard({ url, prominent = false }: { url: string; prominent?: boolean }) {
  const smsHref = `sms:?&body=${encodeURIComponent(`Send me the details and a couple of photos here and I'll get you a quote: ${url}`)}`;

  return (
    <div
      className={cn(
        "mb-6 rounded-2xl border p-5",
        prominent ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-white"
      )}
    >
      <h2 className="text-base font-semibold text-slate-900">
        {prominent ? "Step 1: share your link" : "Your quote-request link"}
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        {prominent
          ? "Put it on your website, Google Business profile, Facebook page — or just text it to the next customer who calls."
          : "Text it to a customer or put it anywhere people find you."}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="flex-1 truncate rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
          {url}
        </code>
        <div className="flex gap-2">
          <CopyButton value={url} variant="primary" className="flex-1 sm:flex-none" />
          <a
            href={smsHref}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 sm:hidden"
          >
            Text it
          </a>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 sm:inline-flex"
          >
            Preview ↗
          </a>
        </div>
      </div>
    </div>
  );
}
