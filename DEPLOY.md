# Deploying to Railway

Two services in one Railway project: the app itself, and a small cron
service that pings the 48-hour follow-up endpoint hourly. Budget: roughly
$5–10/month for the app + a small Postgres instance at this stage.

## 1. Create the project and database

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → pick this repo.
2. In the project canvas: **+ New** → **Database** → **Add PostgreSQL**. Railway names this service `Postgres` by default.

## 2. Configure the web service

Railway should detect `railway.json` automatically (it's the default config
path, so no extra setting needed for this service). It already sets:
- `preDeployCommand`: `npx prisma migrate deploy` (runs before every deploy)
- `startCommand`: `npm run start`
- a healthcheck against `/`

Open the web service → **Variables** and add these (see the table below for
where each value comes from):

| Variable | Where it comes from |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` — a reference to the Postgres service you just added (adjust the service name if you renamed it) |
| `AUTH_SECRET` | Generate locally: `npx auth secret` (prints a value — paste it in, don't run this command in production) |
| `AUTH_URL` | Your web service's public URL (see step 3) — you'll fill this in *after* the first deploy generates a domain |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys → Create API Key |
| `EMAIL_FROM` | e.g. `QuoteFlow <onboarding@resend.dev>` while using Resend's shared test domain, or `QuoteFlow <noreply@yourdomain.com>` once you verify your own domain (Resend → Domains) |
| `TWILIO_ACCOUNT_SID` | [twilio.com console](https://console.twilio.com) → Account Info (top of the dashboard) |
| `TWILIO_AUTH_TOKEN` | Same Twilio dashboard page, right next to Account SID |
| `TWILIO_FROM_NUMBER` | Twilio Console → Phone Numbers → Manage → Active Numbers (the number you bought) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key |
| `STRIPE_SECRET_KEY` | [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys → Secret key (use the **test mode** toggle, top right, while testing) |
| `STRIPE_WEBHOOK_SECRET` | Created in step 4 below, after you register the webhook endpoint |
| `STRIPE_PRICE_ID` | Stripe Dashboard → Product catalog → create a $49/mo recurring product → copy the **Price ID** (`price_...`) it generates |
| `STRIPE_PUBLISHABLE_KEY` | Same Stripe API keys page as the secret key (only needed if you add client-side Stripe.js later — safe to leave blank for now) |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Storage → create a Blob store → `.env.local` tab shows this token (Vercel Blob works from any host, not just Vercel deployments) |
| `ADMIN_EMAILS` | Your own email — comma-separate more if needed |
| `CRON_SECRET` | Any random string you make up, e.g. `openssl rand -hex 24` — must match the cron service's `CRON_SECRET` in step 5 |
| `NEXT_PUBLIC_APP_URL` | Same as `AUTH_URL` — your public domain, filled in after step 3 |

Deploy once with `AUTH_URL`/`NEXT_PUBLIC_APP_URL` left blank or set to a
placeholder — you need a real domain first (next step) before they're correct.

## 3. Get your public domain

Web service → **Settings** → **Networking** → **Public Networking** → **Generate Domain**.
Copy the resulting `https://your-app.up.railway.app` URL, then go back to
**Variables** and set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to that exact URL.
Redeploy so both take effect.

## 4. Point Stripe's webhook at the deployed URL

Stripe Dashboard → Developers → Webhooks → **Add endpoint**:
- URL: `https://your-app.up.railway.app/api/stripe/webhook`
- Events to send: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

Stripe shows a **Signing secret** (`whsec_...`) once the endpoint is created —
paste that into the web service's `STRIPE_WEBHOOK_SECRET` variable and redeploy.

## 5. Add the cron service (48-hour follow-up)

In the same Railway project: **+ New** → **Empty Service** (or **GitHub Repo**
pointing at this same repo again). Then:

1. Service → **Settings** → **Config-as-code** → set the config file path to
   `/railway-cron.json` (this repo's second config — it runs
   `node scripts/trigger-follow-up.mjs` on an hourly cron schedule instead of
   staying up as a web server).
2. Service → **Variables**, add:
   - `APP_URL` = the same public domain from step 3
   - `CRON_SECRET` = the exact same value you set on the web service

The schedule is already set to `0 * * * *` (once an hour) in
`railway-cron.json` — no dashboard cron config needed, it's committed to the
repo. Once deployed, check the service's **Deployments** log after the first
scheduled run; you should see `follow-up cron -> 200 {"checked":N,"sent":N}`.

## 6. Sanity check

- Visit your public URL — the landing page should load.
- `/admin/errors` (signed in as an `ADMIN_EMAILS` address) should be empty,
  or only show things you expect (e.g. a missing key you haven't added yet).
- Send yourself a real quote through the full flow and confirm the SMS/email
  actually arrive instead of being console-logged.
