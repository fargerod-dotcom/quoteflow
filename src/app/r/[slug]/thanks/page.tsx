import { prisma } from "@/lib/prisma";
import { countryOf } from "@/lib/countries";
import { t, type MessageKey } from "@/lib/i18n";

const NEXT: [MessageKey, MessageKey][] = [
  ["thanks.step1When", "thanks.step1What"],
  ["thanks.step2When", "thanks.step2What"],
  ["thanks.step3When", "thanks.step3What"],
];

export default async function IntakeThanksPage({ params }: { params: { slug: string } }) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    select: { name: true, country: true },
  });
  const { lang } = countryOf(business?.country);
  const name = business?.name ?? t("thanks.businessFallback", lang);

  return (
    <div lang={lang} className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-lg px-4 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">{t("thanks.title", lang)}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("thanks.body", lang, { business: name })}</p>

          <ol className="mt-8 flex flex-col gap-4 text-left">
            {NEXT.map(([when, what]) => (
              <li key={when} className="flex gap-3">
                <span className="w-12 flex-shrink-0 pt-0.5 text-xs font-bold uppercase tracking-wider text-brand-600">
                  {t(when, lang)}
                </span>
                <span className="text-sm text-slate-700">{t(what, lang)}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">{t("thanks.close", lang)}</p>
      </div>
    </div>
  );
}
