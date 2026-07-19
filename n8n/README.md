# FashionHub — n8n Workflows

Automation layer for FashionHub, running on the self-hosted n8n instance
(Render free web service, image `n8nio/n8n:latest`, Postgres persistence on Supabase —
see `docs/DEPLOYMENT.md` §6 and §8).

## Workflows

| File | Trigger | What it does |
|---|---|---|
| `workflows/order-confirmation.json` | `POST {N8N_URL}/webhook/order-created` | Formats an order confirmation (order id, items, total, COD, city) and sends it to the customer over WhatsApp Cloud API. An IF node skips the WhatsApp send when `phone` is empty (web-chat orders may have none) — the webhook still ACKs 200 immediately either way. A second branch from the same webhook emails the admin a new-order alert. |
| `workflows/admin-notify.json` | `POST {N8N_URL}/webhook/complaint-received` | Emails the admin a complaint summary (customer, phone, channel, message text). |
| `workflows/daily-sales-report.json` | Schedule — daily 20:00 Asia/Karachi | Logs into the server API, pulls `/api/admin/stats`, and emails a short daily summary (today's revenue and order count, all-time totals, top product, low-stock list). |

Design note: n8n does not allow two active workflows to register the same webhook
path, so the admin new-order email lives as a second branch inside
`order-confirmation.json` (both fed by the single `order-created` webhook) rather than
in a separate workflow. `admin-notify.json` owns only the `complaint-received` path.

### Expected payloads (posted by the server, fire-and-forget)

```
POST /webhook/order-created
{ "orderId": "FH-2026-0001", "customerName": "Ayesha", "phone": "923001234567",
  "items": [{ "name": "Black Embroidered Maxi", "size": "M", "qty": 1 }],
  "total": 5850, "city": "Islamabad", "channel": "whatsapp" }

POST /webhook/complaint-received
{ "customerName": "Ali", "phone": "923001234567", "channel": "instagram",
  "text": "My parcel arrived damaged" }
```

## Required n8n environment variables (Render → n8n service → Environment)

In addition to the base n8n vars from `docs/DEPLOYMENT.md` §8 (`DB_TYPE`,
`DB_POSTGRESDB_*`, `N8N_ENCRYPTION_KEY`, `WEBHOOK_URL`, `N8N_PORT=10000`), add:

| Var | Used by | Value |
|---|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | order-confirmation | Meta app → WhatsApp → API Setup (same value as the server's) |
| `WHATSAPP_ACCESS_TOKEN` | order-confirmation | Permanent system-user token (same as the server's) |
| `SERVER_URL` | daily-sales-report | Render server URL, no trailing slash, e.g. `https://fashionhub-server.onrender.com` |
| `ADMIN_EMAIL` | all email nodes | Where notifications/reports go (also used as From address) |
| `FH_ADMIN_EMAIL` | daily-sales-report | Dashboard admin login email (`admin@fashionhub.pk`) |
| `FH_ADMIN_PASSWORD` | daily-sales-report | Dashboard admin password |

Workflows read these with `{{ $env.X }}` expressions — no secrets live in the JSON.
Do not set `N8N_BLOCK_ENV_ACCESS_IN_NODE=true`; it would break these expressions.
On Render: service → Environment → Add Environment Variable → Save (service redeploys).

## SMTP credential ("FashionHub SMTP")

All email nodes reference one SMTP credential named **FashionHub SMTP**. Create it once:

Recommended free option — **Brevo** (300 emails/day free):
1. https://www.brevo.com → free sign-up → verify your email.
2. Top-right menu → **SMTP & API** → **SMTP** tab → note the values and click
   **Generate a new SMTP key**.
3. In n8n: **Credentials → Add credential → SMTP**:
   - Name: `FashionHub SMTP`
   - Host: `smtp-relay.brevo.com`, Port: `587`, SSL/TLS: off (STARTTLS is used on 587)
   - User: the login shown on the SMTP tab (usually your Brevo account email)
   - Password: the generated SMTP key

Alternative — **Gmail app password** (requires 2FA on the Google account):
1. Google Account → Security → 2-Step Verification → enable.
2. https://myaccount.google.com/apppasswords → create app password for "Mail".
3. n8n SMTP credential: Host `smtp.gmail.com`, Port `465`, SSL/TLS: on,
   User = your Gmail address, Password = the 16-char app password.
   (With Gmail, set `ADMIN_EMAIL` to that Gmail address so the From matches.)

After import, open each Send Email node once and pick **FashionHub SMTP** from the
credential dropdown (imported workflows carry the credential *name* only, not the
credential itself).

## Import & activate

1. Open the n8n UI → **Workflows → Add workflow → ⋯ (top-right) → Import from File…**
   (or drag the JSON onto the canvas). Repeat for each file in `workflows/`.
2. Open each Send Email node → select the **FashionHub SMTP** credential.
3. Toggle each workflow **Active** (top-right switch). Production webhook URLs only
   respond while the workflow is active.
4. Set the server env var so it knows where to post:
   `N8N_WEBHOOK_BASE_URL=https://<your-n8n>.onrender.com`
   The server then posts to `${N8N_WEBHOOK_BASE_URL}/webhook/order-created` and
   `${N8N_WEBHOOK_BASE_URL}/webhook/complaint-received`.

CLI alternative (inside the n8n container/shell):
`n8n import:workflow --separate --input=/path/to/n8n/workflows`

## Local testing

```bash
# start n8n locally (Node 20+)
N8N_SECURE_COOKIE=false ADMIN_EMAIL=you@example.com SERVER_URL=http://localhost:5000 \
WHATSAPP_PHONE_NUMBER_ID=test WHATSAPP_ACCESS_TOKEN=test \
FH_ADMIN_EMAIL=admin@fashionhub.pk FH_ADMIN_PASSWORD=yourpass \
npx n8n
```

Open http://localhost:5678, create the owner account, import the workflows.
In the editor, open a workflow and click **Execute workflow** — the webhook then
listens once on the **test** URL (`/webhook-test/...`). For always-on **production**
URLs (`/webhook/...`), activate the workflow instead.

Simulate the server's posts:

```bash
curl -X POST http://localhost:5678/webhook-test/order-created \
  -H "Content-Type: application/json" \
  -d '{"orderId":"FH-2026-0001","customerName":"Ayesha","phone":"923001234567","items":[{"name":"Black Embroidered Maxi","size":"M","qty":1}],"total":5850,"city":"Islamabad","channel":"web"}'

curl -X POST http://localhost:5678/webhook-test/complaint-received \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Ali","phone":"923001234567","channel":"instagram","text":"My parcel arrived damaged"}'
```

To test daily-sales-report without waiting for 20:00, open it and click
**Execute workflow** (the schedule node fires immediately in manual mode).

Notes:
- WhatsApp test numbers can only message recipients verified in the Meta dashboard
  (up to 5) — use your own verified number as `phone` when testing end-to-end.
- Render free spins down after 15 min idle; the cron-job.org ping on `/healthz`
  (DEPLOYMENT §10) keeps webhook latency sane. Server-side calls are fire-and-forget,
  so a cold n8n at worst delays a notification.
