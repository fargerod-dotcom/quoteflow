"use client";

import { countryOf, type CountryCode, type Lang } from "@/lib/countries";
import { t } from "@/lib/i18n";

export function DatePicker({ dates, country, lang }: { dates: Date[]; country: CountryCode; lang: Lang }) {
  const { locale } = countryOf(country);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const dayMonth = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  return (
    <fieldset>
      <legend className="mb-2 text-base font-semibold text-slate-900">{t("quote.pickDate", lang)}</legend>
      <p className="mb-3 text-sm text-slate-500">{t("quote.pickDateHint", lang)}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {dates.map((date, i) => {
          const value = date.toISOString();
          return (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-slate-200 px-4 py-3 transition-colors hover:border-slate-300 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 sm:flex-col sm:items-center sm:gap-1 sm:text-center"
            >
              <input type="radio" name="scheduledDate" value={value} required defaultChecked={i === 0} className="sr-only" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{weekday.format(date)}</span>
              <span className="text-lg font-bold text-slate-900">{dayMonth.format(date)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
