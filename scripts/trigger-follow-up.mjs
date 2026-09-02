const appUrl = process.env.APP_URL;
const cronSecret = process.env.CRON_SECRET;

if (!appUrl || !cronSecret) {
  console.error("trigger-follow-up: APP_URL and CRON_SECRET must both be set");
  process.exit(1);
}

const res = await fetch(`${appUrl}/api/cron/follow-up`, {
  headers: { Authorization: `Bearer ${cronSecret}` },
});
const body = await res.text();
console.log(`follow-up cron -> ${res.status} ${body}`);

if (!res.ok) process.exit(1);
