import { calcTotals } from "@/lib/vat";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { LineItem } from "@/lib/ai/schema";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shared inline-styled shell so the emails look the same in Gmail/Outlook/Apple Mail. */
function layout({ businessName, body }: { businessName: string; body: string }): string {
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
        <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">Sent via QuoteFlow</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:10px;">${escapeHtml(label)}</a>`;
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
}: {
  businessName: string;
  customerName: string;
  summary: string;
  lineItems: LineItem[];
  /** MVA percentage; 0 hides the MVA breakdown. */
  vatRate?: number;
  total: number;
  estimatedHours: number;
  link: string;
}): string {
  const rate = vatRate ?? 0;
  const { subtotal, vat } = calcTotals(lineItems, rate);
  const vatRows =
    rate > 0
      ? `
      <tr>
        <td style="padding:12px 0 2px;font-size:13px;color:#64748b;">Subtotal ekskl. mva</td>
        <td align="right" style="padding:12px 0 2px;font-size:13px;color:#64748b;">${formatCurrency(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:2px 0;font-size:13px;color:#64748b;">MVA ${rate}%</td>
        <td align="right" style="padding:2px 0;font-size:13px;color:#64748b;">${formatCurrency(vat)}</td>
      </tr>`
      : "";
  const rows = lineItems
    .map(
      (li) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">
            ${escapeHtml(li.description)}${li.quantity !== 1 ? ` <span style="color:#94a3b8;">× ${li.quantity}</span>` : ""}
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;white-space:nowrap;">
            ${formatCurrency(li.quantity * li.unitPrice)}
          </td>
        </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 6px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Your quote</p>
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Hi ${escapeHtml(customerName)}, here's your quote from ${escapeHtml(businessName)}.</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(summary)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rows}
      ${vatRows}
      <tr>
        <td style="padding:${rate > 0 ? "8" : "14"}px 0 0;font-size:16px;font-weight:700;">${rate > 0 ? "Total inkl. mva" : "Total"}</td>
        <td align="right" style="padding:14px 0 0;font-size:20px;font-weight:700;color:#2563eb;">${formatCurrency(total)}</td>
      </tr>
    </table>
    <p style="margin:6px 0 24px;font-size:13px;color:#64748b;">Estimated time on site: about ${estimatedHours} hour${estimatedHours === 1 ? "" : "s"}.</p>
    ${button(link, "View quote & pick a date")}
    <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">Or copy this link: <a href="${link}" style="color:#2563eb;">${link}</a></p>
  `;
  return layout({ businessName, body });
}

export function bookingConfirmedEmailHtml({
  businessName,
  customerName,
  scheduledDate,
  total,
  address,
  calendarLink,
}: {
  businessName: string;
  customerName: string;
  scheduledDate: Date;
  total: number;
  address: string;
  calendarLink: string;
}): string {
  const body = `
    <p style="margin:0 0 6px;font-size:13px;color:#16a34a;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">You're booked</p>
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Thanks ${escapeHtml(customerName)} — ${escapeHtml(businessName)} will see you on ${formatDate(scheduledDate)}.</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:16px;">
      <tr><td style="padding:4px 16px;font-size:14px;color:#64748b;">Date</td><td align="right" style="padding:4px 16px;font-size:14px;font-weight:600;">${formatDate(scheduledDate)}</td></tr>
      <tr><td style="padding:4px 16px;font-size:14px;color:#64748b;">Address</td><td align="right" style="padding:4px 16px;font-size:14px;font-weight:600;">${escapeHtml(address)}</td></tr>
      <tr><td style="padding:4px 16px;font-size:14px;color:#64748b;">Quoted total</td><td align="right" style="padding:4px 16px;font-size:14px;font-weight:600;">${formatCurrency(total)}</td></tr>
    </table>
    <p style="margin:20px 0;">${button(calendarLink, "Add to Google Calendar")}</p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">Need to reschedule? Just reply to the text message you received.</p>
  `;
  return layout({ businessName, body });
}

export function ownerNewRequestEmailHtml({
  businessName,
  customerName,
  address,
  description,
  total,
  link,
}: {
  businessName: string;
  customerName: string;
  address: string;
  description: string;
  total: number;
  link: string;
}): string {
  const body = `
    <p style="margin:0 0 6px;font-size:13px;color:#2563eb;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">New job request</p>
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${escapeHtml(customerName)} · ${escapeHtml(address)}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;white-space:pre-wrap;">${escapeHtml(description)}</p>
    <p style="margin:0 0 20px;font-size:14px;color:#64748b;">AI draft ready: <strong style="color:#0f172a;">${formatCurrency(total)}</strong> — review it and send in one tap.</p>
    ${button(link, "Review & send quote")}
  `;
  return layout({ businessName, body });
}
