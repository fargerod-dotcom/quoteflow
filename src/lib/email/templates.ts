import { presentTotals } from "@/lib/tax";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { t } from "@/lib/i18n";
import type { CountryCode, Lang } from "@/lib/countries";
import type { LineItem } from "@/lib/ai/schema";

/** Emails are not React and have no context: the country and language are
 *  props, like everything else these pure string builders need. */
type Locale = { country: CountryCode; lang: Lang };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shared inline-styled shell so the emails look the same in Gmail/Outlook/Apple Mail. */
function layout({ businessName, body, lang }: { businessName: string; body: string; lang: Lang }): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr><td style="background:#0f172a;padding:20px 28px;">
            <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.01em;">${escapeHtml(businessName)}</span>
          </td></tr>
          <tr><td style="padding:28px;">${body}</td></tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">${escapeHtml(t("email.footer", lang))}</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:10px;">${escapeHtml(label)}</a>`;
}

function totalsRow(label: string, value: string): string {
  return `
      <tr>
        <td style="padding:2px 0;font-size:13px;color:#64748b;">${escapeHtml(label)}</td>
        <td align="right" style="padding:2px 0;font-size:13px;color:#64748b;">${value}</td>
      </tr>`;
}

export function quoteEmailHtml({
  businessName,
  customerName,
  summary,
  lineItems,
  vatRate,
  total,
  estimatedHours,
  link,
  country,
  lang,
}: Locale & {
  businessName: string;
  customerName: string;
  summary: string;
  lineItems: LineItem[];
  /** Tax percentage; 0 hides the breakdown entirely. */
  vatRate?: number;
  total: number;
  estimatedHours: number;
  link: string;
}): string {
  const totals = presentTotals(lineItems, { country, lang, vatRate: vatRate ?? 0 });
  const breakdown =
    totals.kind === "breakdown"
      ? totalsRow(totals.subtotalLabel, formatCurrency(totals.subtotal, country)) +
        totalsRow(totals.taxLabel, formatCurrency(totals.tax, country))
      : "";
  const rows = lineItems
    .map(
      (li) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">
            ${escapeHtml(li.description)}${li.quantity !== 1 ? ` <span style="color:#94a3b8;">× ${li.quantity}</span>` : ""}
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;white-space:nowrap;">
            ${formatCurrency(li.quantity * li.unitPrice, country)}
          </td>
        </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 6px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(t("quote.eyebrowYours", lang))}</p>
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">${escapeHtml(t("email.quoteHeading", lang, { name: customerName, business: businessName }))}</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(summary)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rows}
      ${breakdown}
      <tr>
        <td style="padding:${totals.kind === "breakdown" ? "8" : "14"}px 0 0;font-size:16px;font-weight:700;">${escapeHtml(totals.totalLabel)}</td>
        <td align="right" style="padding:14px 0 0;font-size:20px;font-weight:700;color:#2563eb;">${formatCurrency(total, country)}</td>
      </tr>
    </table>
    <p style="margin:6px 0 24px;font-size:13px;color:#64748b;">${escapeHtml(t("quote.timeOnSite", lang, { hours: formatNumber(estimatedHours, country) }))}</p>
    ${button(link, t("email.quoteButton", lang))}
    <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">${escapeHtml(t("email.copyLink", lang))} <a href="${link}" style="color:#2563eb;">${link}</a></p>
  `;
  return layout({ businessName, body, lang });
}

export function bookingConfirmedEmailHtml({
  businessName,
  customerName,
  scheduledDate,
  total,
  address,
  calendarLink,
  country,
  lang,
}: Locale & {
  businessName: string;
  customerName: string;
  scheduledDate: Date;
  total: number;
  address: string;
  calendarLink: string;
}): string {
  const date = formatDate(scheduledDate, country);
  const body = `
    <p style="margin:0 0 6px;font-size:13px;color:#16a34a;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">${escapeHtml(t("email.bookedEyebrow", lang))}</p>
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">${escapeHtml(t("email.bookedHeading", lang, { name: customerName, business: businessName, date }))}</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:16px;">
      <tr><td style="padding:4px 16px;font-size:14px;color:#64748b;">${escapeHtml(t("quote.dateLabel", lang))}</td><td align="right" style="padding:4px 16px;font-size:14px;font-weight:600;">${escapeHtml(date)}</td></tr>
      <tr><td style="padding:4px 16px;font-size:14px;color:#64748b;">${escapeHtml(t("quote.addressLabel", lang))}</td><td align="right" style="padding:4px 16px;font-size:14px;font-weight:600;">${escapeHtml(address)}</td></tr>
      <tr><td style="padding:4px 16px;font-size:14px;color:#64748b;">${escapeHtml(t("quote.quotedTotal", lang))}</td><td align="right" style="padding:4px 16px;font-size:14px;font-weight:600;">${formatCurrency(total, country)}</td></tr>
    </table>
    <p style="margin:20px 0;">${button(calendarLink, t("quote.addToCalendar", lang))}</p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">${escapeHtml(t("email.bookedReschedule", lang))}</p>
  `;
  return layout({ businessName, body, lang });
}

/** Owner-facing, so the copy stays English until the dashboard pass. */
export function ownerNewRequestEmailHtml({
  businessName,
  customerName,
  address,
  description,
  total,
  link,
  country,
}: {
  businessName: string;
  customerName: string;
  address: string;
  description: string;
  total: number;
  link: string;
  country: CountryCode;
}): string {
  const body = `
    <p style="margin:0 0 6px;font-size:13px;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">New job request</p>
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${escapeHtml(customerName)} · ${escapeHtml(address)}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;white-space:pre-wrap;">${escapeHtml(description)}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">AI draft ready: <strong style="color:#0f172a;">${formatCurrency(total, country)}</strong> — review it and send in one tap.</p>
    ${button(link, "Review & send quote")}
  `;
  return layout({ businessName, body, lang: "en" });
}
