import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { IntakeForm } from "@/components/intake/IntakeForm";
import { countryOf } from "@/lib/countries";
import { t } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    select: { name: true, country: true },
  });
  const { lang } = countryOf(business?.country);
  return {
    title: business ? t("intake.metaTitle", lang, { business: business.name }) : t("intake.metaTitleFallback", lang),
    description: business ? t("intake.metaDescription", lang, { business: business.name }) : undefined,
  };
}

export default async function IntakePage({ params }: { params: { slug: string } }) {
  const business = await prisma.business.findUnique({ where: { slug: params.slug } });
  // The page speaks the business's language; an unknown link falls back to it too.
  const { code: country, lang } = countryOf(business?.country);

  if (!business) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">{t("intake.notFoundTitle", lang)}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("intake.notFoundBody", lang)}</p>
      </div>
    );
  }

  const tradeLabel = t(`trade.${business.trade}`, lang);
  const initials = business.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 px-4 pb-16 pt-8 text-white">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold">{business.name}</h1>
              <p className="text-sm text-slate-300">
                {tradeLabel}
                {business.serviceArea ? ` · ${business.serviceArea}` : ""}
              </p>
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold leading-tight">{t("intake.heroTitle", lang)}</h2>
          <p className="mt-2 text-sm text-slate-300">{t("intake.heroBody", lang)}</p>
        </div>
      </div>

      <div className="mx-auto -mt-8 max-w-lg px-4 pb-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <IntakeForm slug={business.slug} businessName={business.name} country={country} lang={lang} />
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          {t("intake.privacyNote", lang, { business: business.name })}
        </p>
      </div>
    </div>
  );
}
