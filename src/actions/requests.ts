"use server";

import { File as NodeFile } from "node:buffer";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { prisma } from "@/lib/prisma";
import { uploadPhoto } from "@/lib/storage/blob";
import { draftQuote, type PhotoInput } from "@/lib/ai/claude-client";
import { sendSms } from "@/lib/sms/twilio";
import { sendEmail } from "@/lib/email/resend";
import { logError } from "@/lib/errors";
import { clientIpHash, intakeAllowed, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { calcTotals } from "@/lib/vat";
import { ownerNewRequestEmailHtml } from "@/lib/email/templates";
import { interpolate } from "@/lib/utils";
import { countryOf } from "@/lib/countries";
import { OWNER_NEW_REQUEST_SMS, MAX_PHOTOS, MAX_PHOTO_BYTES } from "@/lib/constants";
import type { QuoteConfidence } from "@prisma/client";

const CONFIDENCE_MAP: Record<string, QuoteConfidence> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

// Node 18 has no global `File` constructor (added in Node 20); fall back to
// node:buffer's implementation so file uploads work on older runtimes too.
const FileCtor: typeof File = (globalThis.File ?? NodeFile) as typeof File;

export type IntakeState = { error: string | null };

/**
 * Form-state wrapper for the intake form: turns the validation/abuse errors
 * `createRequest` throws into a message the customer can actually read.
 * (In production Next masks thrown server-action errors behind a generic
 * "application error" page.) Redirects pass straight through.
 */
export async function submitRequest(_prev: IntakeState, formData: FormData): Promise<IntakeState> {
  try {
    await createRequest(formData);
    return { error: null };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: err instanceof Error ? err.message : "Something went wrong. Please try again." };
  }
}

export async function createRequest(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business) throw new Error("This booking link is no longer valid.");
  const { code: country } = countryOf(business.country);

  // Honeypot: real users never see the "website" field, bots fill it in.
  // Pretend it worked so the bot has nothing to learn from.
  if (String(formData.get("website") ?? "").trim()) {
    await logError("intake.honeypot", "Honeypot field filled", { slug });
    redirect(`/r/${slug}/thanks`);
  }

  const ipHash = clientIpHash();
  if (!(await intakeAllowed(business.id, ipHash))) {
    await logError("intake.rate_limit", "Intake rate limit hit", { slug, ipHash });
    throw new Error(RATE_LIMIT_MESSAGE);
  }

  const description = String(formData.get("description") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim() || null;
  const customerAddress = String(formData.get("customerAddress") ?? "").trim();
  const preferredDates = formData
    .getAll("preferredDates")
    .map(String)
    .filter(Boolean)
    .map((d) => new Date(d));

  if (
    !description ||
    !customerName ||
    !customerPhone ||
    !customerAddress ||
    preferredDates.length === 0
  ) {
    throw new Error("Please fill in all required fields and pick at least one preferred date.");
  }

  const photoFiles = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof FileCtor && f.size > 0)
    .slice(0, MAX_PHOTOS);

  for (const file of photoFiles) {
    if (file.size > MAX_PHOTO_BYTES) {
      throw new Error(`Photo "${file.name}" is too large — please use photos under 8MB.`);
    }
  }

  const photoBuffers = await Promise.all(
    photoFiles.map(async (file) => ({ file, buffer: Buffer.from(await file.arrayBuffer()) }))
  );

  const request = await prisma.request.create({
    data: {
      businessId: business.id,
      description,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      preferredDates,
      ipHash,
    },
  });

  // Photo bytes are already in memory from the multipart upload — upload to
  // storage and call Claude concurrently rather than round-tripping through
  // storage first, so the customer isn't waiting on two sequential network hops.
  const [photoRecords, aiResult] = await Promise.all([
    Promise.all(
      photoBuffers.map(async ({ file, buffer }, order) => {
        const url = await uploadPhoto({
          businessId: business.id,
          filename: file.name,
          bytes: buffer,
          contentType: file.type || "image/jpeg",
        });
        return { url, order };
      })
    ),
    draftQuote({
      trade: business.trade,
      hourlyRate: Number(business.hourlyRate),
      calloutFee: Number(business.calloutFee),
      description,
      photos: photoBuffers.map(({ file, buffer }) => ({
        base64: buffer.toString("base64"),
        mediaType: (file.type || "image/jpeg") as PhotoInput["mediaType"],
      })),
      requestId: request.id,
    }),
  ]);

  if (photoRecords.length > 0) {
    await prisma.photo.createMany({
      data: photoRecords.map((p) => ({ requestId: request.id, url: p.url, order: p.order })),
    });
  }

  // The AI prices ex-MVA; the stored total is what the customer actually pays.
  const totals = calcTotals(aiResult.draft.lineItems, Number(business.vatRate));

  await prisma.quote.create({
    data: {
      requestId: request.id,
      lineItems: aiResult.draft.lineItems,
      estimatedHours: aiResult.draft.estimatedHours,
      total: totals.total,
      vatRate: business.vatRate,
      summary: aiResult.draft.summary,
      confidence: CONFIDENCE_MAP[aiResult.draft.confidence],
      aiRawResponse: aiResult.raw ? { text: String(aiResult.raw) } : undefined,
      aiFailedFallback: aiResult.failedFallback,
    },
  });

  const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/requests/${request.id}`;
  await sendSms({
    businessId: business.id,
    country,
    to: business.ownerPhone,
    body: interpolate(OWNER_NEW_REQUEST_SMS, { customerName, customerAddress, link: reviewLink }),
  });

  // Also email the owner — SMS can be missed, and the email carries the full description.
  const owner = await prisma.user.findUnique({ where: { id: business.userId }, select: { email: true } });
  const ownerEmail = business.ownerNotifyEmail ?? owner?.email;
  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `New job request: ${customerName} — ${customerAddress}`,
      html: ownerNewRequestEmailHtml({
        businessName: business.name,
        customerName,
        address: customerAddress,
        description,
        total: totals.total,
        link: reviewLink,
      }),
    });
  }

  redirect(`/r/${slug}/thanks`);
}
