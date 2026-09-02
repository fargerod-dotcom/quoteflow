# QuoteFlow

AI intake & quoting for local service businesses. See the product brief this was
built from for the full feature spec — this README covers running the code.

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · PostgreSQL via Prisma ·
Auth.js v5 (email magic link) · Anthropic Claude (quote drafting) · Twilio (SMS) ·
Resend (email) · Stripe (billing) · Vercel Blob (photo storage) · Vitest (tests).

## Local setup

1. **Database** — start Postgres with Docker:
   ```bash
   docker-compose up -d
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment** — copy `.env.example` to `.env` and fill in `AUTH_SECRET`
   (generate with `npx auth secret`) and `CRON_SECRET` (any random string) at
   minimum. Everything else (Resend, Twilio, Stripe, Anthropic, Vercel Blob) is
   optional for local development — see "Fallback behavior" below.
4. **Migrate & seed**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   This creates a demo business at `/r/demo-plumbing-co` and a matching login
   at `demo@quoteflow.test`.
5. **Run**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Fallback behavior (no API keys needed to try it locally)

Every external integration fails soft instead of erroring when its env var is
unset, so the whole flow works end-to-end with zero third-party accounts:

| Service | Env var | Without it |
|---|---|---|
| Anthropic (quote drafting) | `ANTHROPIC_API_KEY` | Requests still get created, with a placeholder "please review manually" draft (low confidence) |
| Resend (email + magic link) | `RESEND_API_KEY` | Emails are logged to the console instead of sent — copy the sign-in link from the terminal |
| Twilio (SMS) | `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | SMS bodies are logged to the console instead of sent |
| Stripe (billing) | `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` | Onboarding skips Checkout; the business stays on its 14-day trial |
| Vercel Blob (photo storage) | `BLOB_READ_WRITE_TOKEN` | Photos are written to `/public/uploads` instead |

Every fallback and every real failure (a bad Claude response, a Twilio error,
a Stripe webhook signature mismatch, ...) is recorded in the `ErrorLog` table,
visible at `/admin/errors` to anyone whose email is listed in `ADMIN_EMAILS`.

## Testing

```bash
npm run test
```

## Deploying

Target is Railway (app + Postgres + a small cron service), roughly $5–10/month
at this stage. See [DEPLOY.md](./DEPLOY.md) for the full step-by-step,
including every environment variable and exactly where each one comes from.
