"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitRequest, type IntakeState } from "@/actions/requests";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { PhotoUploader } from "@/components/intake/PhotoUploader";
import { countryOf, type CountryCode, type Lang } from "@/lib/countries";
import { MAX_PHOTOS } from "@/lib/constants";
import { t } from "@/lib/i18n";

function SubmitButton({ lang }: { lang: Lang }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-2 w-full">
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {t("intake.submitting", lang)}
        </>
      ) : (
        t("intake.submit", lang)
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

export function IntakeForm({
  slug,
  businessName,
  country,
  lang,
}: {
  slug: string;
  businessName: string;
  country: CountryCode;
  lang: Lang;
}) {
  const min = todayIso();
  const [state, formAction] = useFormState<IntakeState, FormData>(submitRequest, { error: null });
  const phoneExample = countryOf(country).phone.exampleNational;

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="slug" value={slug} />
      {/* Honeypot — hidden from people, filled in by bots. Server drops those silently. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <section>
        <SectionHeading n={1} title={t("intake.step1Title", lang)} hint={t("intake.step1Hint", lang)} />
        <Textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder={t("intake.descriptionPlaceholder", lang)}
        />
        <div className="mt-4">
          <Label>{t("intake.photosLabel", lang, { max: MAX_PHOTOS })}</Label>
          <PhotoUploader lang={lang} />
        </div>
      </section>

      <section>
        <SectionHeading n={2} title={t("intake.step2Title", lang)} />
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="customerAddress">{t("intake.addressLabel", lang)}</Label>
            <Input
              id="customerAddress"
              name="customerAddress"
              required
              autoComplete="street-address"
              placeholder={t("intake.addressPlaceholder", lang)}
            />
          </div>
          <div>
            <Label htmlFor="customerName">{t("intake.nameLabel", lang)}</Label>
            <Input id="customerName" name="customerName" required autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="customerPhone">{t("intake.phoneLabel", lang)}</Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder={phoneExample}
            />
            <p className="mt-1 text-xs text-slate-500">{t("intake.phoneHint", lang)}</p>
          </div>
          <div>
            <Label htmlFor="customerEmail">{t("intake.emailLabel", lang)}</Label>
            <Input id="customerEmail" name="customerEmail" type="email" autoComplete="email" inputMode="email" />
          </div>
        </div>
      </section>

      <section>
        <SectionHeading n={3} title={t("intake.step3Title", lang)} hint={t("intake.step3Hint", lang)} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input name="preferredDates" type="date" min={min} required aria-label={t("intake.date1", lang)} />
          <Input name="preferredDates" type="date" min={min} aria-label={t("intake.date2", lang)} />
          <Input name="preferredDates" type="date" min={min} aria-label={t("intake.date3", lang)} />
        </div>
      </section>

      <div>
        {state.error && (
          <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.error}
          </p>
        )}
        <SubmitButton lang={lang} />
        <p className="mt-3 text-center text-xs text-slate-500">
          {t("intake.footerNote", lang, { business: businessName })}
        </p>
      </div>
    </form>
  );
}
