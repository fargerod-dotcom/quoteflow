import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { TRIAL_DAYS } from "@/lib/constants";

const STEPS = [
  {
    n: "1",
    title: "Customer taps your link",
    body: "They describe the job, snap a few photos, and pick dates that work — from their phone, in under two minutes.",
  },
  {
    n: "2",
    title: "AI drafts the quote",
    body: "Claude looks at the photos and description, applies your rates, and writes a line-item quote before you've finished your coffee.",
  },
  {
    n: "3",
    title: "You approve, they book",
    body: "One tap to send. The customer accepts by text, picks a date, and it lands on your calendar. No phone tag.",
  },
];

const FEATURES = [
  ["Photo-aware quotes", "Sees the leak, the panel, the pipe run — not just the words."],
  ["Your prices, your voice", "Set your hourly rate, call-out fee and text templates once."],
  ["Automatic follow-up", "Unanswered quotes get a friendly nudge after 48 hours."],
  ["Text + email", "Customers get a link by SMS and email; accept in one tap."],
  ["Built for the van", "Everything works on a phone, with big buttons and no fiddly menus."],
  ["Calendar built in", "Accepted jobs show up on a week view, nothing to sync."],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Logo className="text-lg" />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            Sign in
          </Link>
          <Link href="/login">
            <Button size="sm">Start free trial</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-10 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              For plumbers, electricians &amp; trades
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Stop losing jobs to <span className="text-brand-600">slow quotes.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
              Customers send photos to your link. AI drafts the quote in seconds. You approve it from your
              phone and they book with one tap. That&rsquo;s it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/login">
                <Button size="lg" className="w-full whitespace-nowrap sm:w-auto">
                  Start {TRIAL_DAYS}-day free trial
                </Button>
              </Link>
              <span className="text-sm text-slate-500">$49/month after · cancel anytime</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="mx-auto w-full max-w-[320px]">
            <div className="rounded-[2.2rem] border-[6px] border-slate-900 bg-slate-900 p-1.5 shadow-2xl">
              <div className="rounded-[1.8rem] bg-slate-50 px-4 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Your quote from</p>
                <p className="text-base font-bold">Joe&rsquo;s Plumbing</p>
                <p className="mt-2 text-xs leading-snug text-slate-600">
                  Replace the leaking P-trap under the kitchen sink and re-seal the drain flange.
                </p>
                <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white text-xs">
                  {[
                    ["Call-out fee", "$75.00"],
                    ["Labour × 1.5h", "$142.50"],
                    ["P-trap kit", "$24.00"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between px-3 py-2">
                      <span className="text-slate-600">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-2 font-bold">
                    <span>Total</span>
                    <span className="text-brand-600">$241.50</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {["Thu, Sep 4", "Fri, Sep 5"].map((d, i) => (
                    <span
                      key={d}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-center text-[11px] ${
                        i === 0 ? "border-brand-500 bg-brand-50 font-semibold text-brand-700" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div className="mt-3 rounded-xl bg-brand-600 py-2.5 text-center text-xs font-semibold text-white">
                  Accept &amp; book
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything a one-van business needs</h2>
        <p className="mt-2 max-w-xl text-slate-600">No CRM to learn. No app to install. Just a link.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Simple pricing. One extra job a year covers it.</h2>
          <p className="mt-6 text-5xl font-bold">
            $49<span className="text-xl font-medium text-slate-400">/month</span>
          </p>
          <p className="mt-3 text-slate-300">
            Unlimited quotes · SMS &amp; email included · {TRIAL_DAYS}-day free trial · cancel anytime
          </p>
          <Link href="/login" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="border-0">
              Get your link →
            </Button>
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row">
        <Logo className="text-sm" />
        <span>© {new Date().getFullYear()} QuoteFlow</span>
      </footer>
    </div>
  );
}
