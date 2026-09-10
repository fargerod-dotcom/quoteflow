/**
 * Every customer-facing string in the app, in one file.
 *
 * `MessageKey` is derived from `en`, and `nb` is typed as a total map over it,
 * so adding an English string and forgetting the Norwegian one is a build
 * error rather than a production surprise.
 *
 * Placeholders here are **single-braced** (`{name}`). The `{{name}}` form is
 * reserved for the SMS/prompt templates a business can edit, which are filled
 * in later by `interpolate()` — the two never collide. `t()` only substitutes
 * when it is given `vars`, so the `sms.*` defaults come back untouched.
 *
 * The tax word is deliberately *not* in the dictionary: `{tax}` is always
 * interpolated from `countryOf(country).tax.label`, which is how "Total inkl.
 * mva" becomes "Total incl. VAT" in Britain with no new strings.
 */

import type { Lang } from "@/lib/countries";

const en = {
  // ---- Intake page (/r/[slug]) ----
  "intake.metaTitle": "Get a quote — {business}",
  "intake.metaTitleFallback": "Get a quote",
  "intake.metaDescription": "Send {business} a few photos and details and get a quote back fast.",
  "intake.notFoundTitle": "Link not found",
  "intake.notFoundBody": "This booking link doesn’t match a business. Double-check the link you were given.",
  "intake.heroTitle": "Get a quote in minutes",
  "intake.heroBody": "Tell us what’s going on, add a couple of photos, and we’ll text you a quote. No obligation.",
  "intake.privacyNote": "Your details are only shared with {business}.",

  // ---- Trades (shown on the customer's intake header) ----
  "trade.PLUMBING": "Plumbing",
  "trade.ELECTRICAL": "Electrical",
  "trade.HVAC": "HVAC",
  "trade.HANDYMAN": "Handyman",
  "trade.LANDSCAPING": "Landscaping",
  "trade.OTHER": "Trade services",

  // ---- Intake form ----
  "intake.step1Title": "What needs doing?",
  "intake.step1Hint": "The more detail, the more accurate the quote.",
  "intake.descriptionPlaceholder":
    "e.g. Kitchen tap is leaking under the sink — been dripping for a week. The cabinet floor is getting wet.",
  "intake.photosLabel": "Photos (optional, up to {max})",
  "intake.step2Title": "Where and who",
  "intake.addressLabel": "Job address",
  "intake.addressPlaceholder": "12 Main St, Springfield",
  "intake.nameLabel": "Your name",
  "intake.phoneLabel": "Mobile number",
  "intake.phoneHint": "We’ll text your quote here.",
  "intake.emailLabel": "Email (optional)",
  "intake.step3Title": "When works for you?",
  "intake.step3Hint": "Pick up to three dates — you’ll confirm one when you accept the quote.",
  "intake.date1": "First preferred date",
  "intake.date2": "Second preferred date",
  "intake.date3": "Third preferred date",
  "intake.submit": "Send request",
  "intake.submitting": "Sending your request…",
  "intake.footerNote": "{business} will review your request and text you a quote. No commitment until you accept.",

  // ---- Photo uploader ----
  "photos.camera": "Camera",
  "photos.add": "Add photos",
  "photos.addMore": "Add more",
  "photos.remove": "Remove photo",
  "photos.emptyHint": "A photo of the problem helps a lot — the quote will be more accurate.",
  "photos.count": "{count} of {max} photos",
  "photos.tooBigOne": "One photo is over 8MB and was skipped.",
  "photos.tooBigMany": "{count} photos are over 8MB and were skipped.",
  "photos.max": "You can attach up to {max} photos.",

  // ---- Thanks page ----
  "thanks.title": "Request sent!",
  "thanks.body": "{business} has your details. Keep an eye on your phone.",
  "thanks.businessFallback": "the business",
  "thanks.step1When": "Now",
  "thanks.step1What": "Your request has landed. They get a text the moment it does.",
  "thanks.step2When": "Soon",
  "thanks.step3When": "Then",
  "thanks.step2What": "You’ll get a text — and an email if you gave one — with a link to your quote.",
  "thanks.step3What": "Open the link, pick the date that suits you, and you’re booked.",
  "thanks.close": "You can close this page.",

  // ---- Quote page (/q/[acceptToken]) ----
  "quote.metaTitle": "Your quote",
  "quote.notFoundTitle": "Quote not found",
  "quote.notFoundBody": "Check the link in your text message and try again.",
  "quote.eyebrowYours": "Your quote",
  "quote.eyebrowFor": "Quote for {name}",
  "quote.eyebrowBooked": "Booking confirmed",
  "quote.eyebrowDeclined": "Quote declined",
  "quote.bookedTitle": "You’re booked!",
  "quote.bookedBody": "We’ve texted you a confirmation.",
  "quote.dateLabel": "Date",
  "quote.addressLabel": "Address",
  "quote.quotedTotal": "Quoted total",
  "quote.addToCalendar": "Add to Google Calendar",
  "quote.rescheduleNote": "Need to reschedule? Reply to the confirmation text.",
  "quote.declinedTitle": "No problem.",
  "quote.declinedBody": "You’ve declined this quote. If you change your mind, get in touch with {business} directly.",
  "quote.notReadyTitle": "This quote isn’t ready yet",
  "quote.notReadyBody": "You’ll get a text as soon as it’s sent.",
  "quote.jobAtNote": "Job at {address}. Accepting confirms the date — nothing is charged online.",
  "quote.timeOnSite": "Estimated time on site: about {hours} h",
  "quote.pickDate": "Pick a date",
  "quote.pickDateHint": "These are the dates you said would work.",
  "quote.accept": "Accept & book",
  "quote.pending": "One moment…",
  "quote.decline": "No thanks, decline",
  "quote.declineConfirm": "Decline this quote? The business will be notified.",

  // ---- Totals (the tax word comes from the registry, never from here) ----
  "quote.total": "Total",
  "quote.subtotalExTax": "Subtotal excl. {tax}",
  "quote.taxAtRate": "{tax} {rate}%",
  "quote.totalInclTax": "Total incl. {tax}",

  // ---- Errors the customer can actually see ----
  "error.linkInvalid": "This booking link is no longer valid.",
  "error.missingFields": "Please fill in all required fields and pick at least one preferred date.",
  "error.photoTooLarge": "Photo “{name}” is too large — please use photos under 8MB.",
  "error.rateLimit":
    "Too many requests from this connection right now. Please try again in an hour, or call the business directly.",
  "error.quoteUnavailable": "This quote is no longer available.",
  "error.pickDate": "Please pick a date.",
  "error.generic": "Something went wrong. Please try again.",

  // ---- Customer emails ----
  "email.footer": "Sent via QuoteFlow",
  "email.quoteSubject": "Your quote from {business} — {total}",
  "email.quoteHeading": "Hi {name}, here’s your quote from {business}.",
  "email.quoteButton": "View quote & pick a date",
  "email.copyLink": "Or copy this link:",
  "email.bookedEyebrow": "You’re booked",
  "email.bookedSubject": "Booking confirmed with {business} — {date}",
  "email.bookedHeading": "Thanks {name} — {business} will see you on {date}.",
  "email.bookedReschedule": "Need to reschedule? Just reply to the text message you received.",

  // ---- Default SMS bodies (a business can override these in settings) ----
  "sms.newQuote":
    "Hi {{customerName}}, {{businessName}} sent you a quote for your job: {{total}}. View and accept it here: {{link}}",
  "sms.followUp":
    "Hi {{customerName}}, just a friendly follow-up on the quote {{businessName}} sent you. You can review and accept it here: {{link}}",
  "sms.confirmation":
    "You’re booked! {{businessName}} will see you on {{scheduledDate}}. Reply to this text if you need to reschedule.",
} as const;

export type MessageKey = keyof typeof en;

/** Typed as a total map, so a missing Norwegian string is a build error. */
const nb: Record<MessageKey, string> = {
  "intake.metaTitle": "Få pristilbud — {business}",
  "intake.metaTitleFallback": "Få pristilbud",
  "intake.metaDescription": "Send {business} noen bilder og litt info, så får du et tilbud raskt.",
  "intake.notFoundTitle": "Fant ikke lenken",
  "intake.notFoundBody": "Denne lenken hører ikke til noen bedrift. Dobbeltsjekk lenken du fikk.",
  "intake.heroTitle": "Få pristilbud på minutter",
  "intake.heroBody":
    "Fortell hva som har skjedd, legg ved et par bilder, så sender vi deg et tilbud på SMS. Helt uforpliktende.",
  "intake.privacyNote": "Opplysningene dine deles bare med {business}.",

  "trade.PLUMBING": "Rørlegger",
  "trade.ELECTRICAL": "Elektriker",
  "trade.HVAC": "Ventilasjon og varme",
  "trade.HANDYMAN": "Altmuligmann",
  "trade.LANDSCAPING": "Anleggsgartner",
  "trade.OTHER": "Håndverkertjenester",

  "intake.step1Title": "Hva trenger du hjelp med?",
  "intake.step1Hint": "Jo mer du skriver, desto mer treffsikkert blir tilbudet.",
  "intake.descriptionPlaceholder":
    "F.eks. Kjøkkenkranen lekker under vasken – den har dryppet i en uke. Det begynner å bli vått i skapet.",
  "intake.photosLabel": "Bilder (valgfritt, inntil {max})",
  "intake.step2Title": "Hvor og hvem",
  "intake.addressLabel": "Adresse for jobben",
  "intake.addressPlaceholder": "Storgata 12, 0184 Oslo",
  "intake.nameLabel": "Navnet ditt",
  "intake.phoneLabel": "Mobilnummer",
  "intake.phoneHint": "Vi sender tilbudet på SMS hit.",
  "intake.emailLabel": "E-post (valgfritt)",
  "intake.step3Title": "Når passer det for deg?",
  "intake.step3Hint": "Velg inntil tre datoer – du bekrefter én når du godtar tilbudet.",
  "intake.date1": "Første ønskede dato",
  "intake.date2": "Andre ønskede dato",
  "intake.date3": "Tredje ønskede dato",
  "intake.submit": "Send forespørsel",
  "intake.submitting": "Sender forespørselen …",
  "intake.footerNote":
    "{business} ser på forespørselen og sender deg et tilbud på SMS. Ingenting er bindende før du godtar.",

  "photos.camera": "Kamera",
  "photos.add": "Legg til bilder",
  "photos.addMore": "Legg til flere",
  "photos.remove": "Fjern bilde",
  "photos.emptyHint": "Et bilde av problemet hjelper mye – da blir tilbudet mer treffsikkert.",
  "photos.count": "{count} av {max} bilder",
  "photos.tooBigOne": "Ett bilde er over 8 MB og ble hoppet over.",
  "photos.tooBigMany": "{count} bilder er over 8 MB og ble hoppet over.",
  "photos.max": "Du kan legge ved inntil {max} bilder.",

  "thanks.title": "Forespørselen er sendt!",
  "thanks.body": "{business} har fått opplysningene dine. Følg med på telefonen.",
  "thanks.businessFallback": "bedriften",
  "thanks.step1When": "Nå",
  "thanks.step1What": "Forespørselen er kommet fram. De får en SMS med en gang.",
  "thanks.step2When": "Snart",
  "thanks.step3When": "Så",
  "thanks.step2What": "Du får en SMS – og en e-post hvis du oppga adresse – med lenke til tilbudet.",
  "thanks.step3What": "Åpne lenken, velg datoen som passer, så er avtalen i boks.",
  "thanks.close": "Du kan lukke denne siden.",

  "quote.metaTitle": "Tilbudet ditt",
  "quote.notFoundTitle": "Fant ikke tilbudet",
  "quote.notFoundBody": "Sjekk lenken i SMS-en du fikk, og prøv igjen.",
  "quote.eyebrowYours": "Tilbudet ditt",
  "quote.eyebrowFor": "Tilbud til {name}",
  "quote.eyebrowBooked": "Avtalen er bekreftet",
  "quote.eyebrowDeclined": "Tilbudet er avslått",
  "quote.bookedTitle": "Da er avtalen i boks!",
  "quote.bookedBody": "Vi har sendt deg en bekreftelse på SMS.",
  "quote.dateLabel": "Dato",
  "quote.addressLabel": "Adresse",
  "quote.quotedTotal": "Totalpris",
  "quote.addToCalendar": "Legg til i Google Kalender",
  "quote.rescheduleNote": "Trenger du å endre tidspunkt? Svar på bekreftelses-SMS-en.",
  "quote.declinedTitle": "Helt greit.",
  "quote.declinedBody": "Du har avslått dette tilbudet. Ombestemmer du deg, ta kontakt med {business} direkte.",
  "quote.notReadyTitle": "Dette tilbudet er ikke klart ennå",
  "quote.notReadyBody": "Du får en SMS så snart det er sendt.",
  "quote.jobAtNote": "Jobben utføres på {address}. Når du godtar, bekrefter du datoen – ingenting belastes her.",
  "quote.timeOnSite": "Beregnet tid på stedet: ca. {hours} t",
  "quote.pickDate": "Velg en dato",
  "quote.pickDateHint": "Dette er datoene du sa passet.",
  "quote.accept": "Godta og book",
  "quote.pending": "Et øyeblikk …",
  "quote.decline": "Nei takk, avslå",
  "quote.declineConfirm": "Vil du avslå tilbudet? Bedriften får beskjed.",

  "quote.total": "Total",
  "quote.subtotalExTax": "Delsum ekskl. {tax}",
  "quote.taxAtRate": "{tax} {rate} %",
  "quote.totalInclTax": "Total inkl. {tax}",

  "error.linkInvalid": "Denne bestillingslenken er ikke gyldig lenger.",
  "error.missingFields": "Fyll ut alle feltene som må fylles ut, og velg minst én ønsket dato.",
  "error.photoTooLarge": "Bildet «{name}» er for stort – bruk bilder under 8 MB.",
  "error.rateLimit":
    "Det har kommet for mange forespørsler fra denne tilkoblingen akkurat nå. Prøv igjen om en time, eller ring bedriften direkte.",
  "error.quoteUnavailable": "Dette tilbudet er ikke tilgjengelig lenger.",
  "error.pickDate": "Velg en dato.",
  "error.generic": "Noe gikk galt. Prøv igjen.",

  "email.footer": "Sendt med QuoteFlow",
  "email.quoteSubject": "Tilbud fra {business} – {total}",
  "email.quoteHeading": "Hei {name}, her er tilbudet fra {business}.",
  "email.quoteButton": "Se tilbudet og velg dato",
  "email.copyLink": "Eller kopier denne lenken:",
  "email.bookedEyebrow": "Avtalen er i boks",
  "email.bookedSubject": "Avtale bekreftet med {business} – {date}",
  "email.bookedHeading": "Takk, {name} – {business} kommer {date}.",
  "email.bookedReschedule": "Trenger du å endre tidspunkt? Svar på SMS-en du fikk.",

  "sms.newQuote":
    "Hei {{customerName}}, {{businessName}} har sendt deg et tilbud på jobben: {{total}}. Se og godta det her: {{link}}",
  "sms.followUp":
    "Hei {{customerName}}, bare en liten påminnelse om tilbudet fra {{businessName}}. Du kan se og godta det her: {{link}}",
  "sms.confirmation":
    "Da er avtalen i boks! {{businessName}} kommer {{scheduledDate}}. Svar på denne meldingen hvis du trenger å endre tidspunkt.",
};

const DICTS: Record<Lang, Record<MessageKey, string>> = { en, nb };

/** Single-brace substitution; an unknown placeholder resolves to "" rather
 *  than leaking `{foo}` onto a customer's screen. */
function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/{\s*(\w+)\s*}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function t(key: MessageKey, lang: Lang, vars?: Record<string, string | number>): string {
  const s = DICTS[lang][key];
  return vars ? fill(s, vars) : s;
}

/** Exported for the dictionary tests only. */
export const DICTIONARIES = DICTS;
