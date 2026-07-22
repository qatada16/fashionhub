# Deployment & API Keys Guide

Everything below is **$0**. Steps marked 👤 are the ones YOU (Qudama) do; everything
else is code/config Claude handles. Do the 👤 steps in order — later ones depend on
earlier URLs. Menu names below match the July 2026 UI of each service.

## 1. MongoDB Atlas (database) ✅ done

→ `server/.env`: `MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/fashionhub`
(Network Access must include `0.0.0.0/0` — Render IPs rotate.)

## 2. Google Gemini API (primary AI) ✅ done

→ `server/.env`: `GEMINI_API_KEY=...`

## 3. Groq (fallback AI + Whisper voice) ✅ done

→ `server/.env`: `GROQ_API_KEY=...`

## 4. Cloudinary (product images) ✅ done

→ `server/.env`: `CLOUDINARY_CLOUD_NAME=...`, `CLOUDINARY_API_KEY=...`, `CLOUDINARY_API_SECRET=...`

## 5. Meta App — WhatsApp + Instagram 👤

One Meta app serves both channels. Already created and tokens verified in Phase 4
(`npm run check:meta` passes) — steps kept here for reference / token renewal.

### 5a. Create the app

1. https://developers.facebook.com → **My Apps** → **Create app**.
2. Enter app name + contact email. On the **Use cases** screen pick **Other** (bottom
   of the list) → app type **Business** → attach your **business portfolio** when asked
   (create one if prompted — it's free).
3. On the app dashboard, under **Add products to your app**, click **Set up** on
   **WhatsApp** and on **Instagram**. Both then appear in the left sidebar.
4. **App settings → Basic** → copy **App secret** (click **Show**).

→ `server` env: `META_APP_SECRET=...`

### 5b. WhatsApp Cloud API

1. Left sidebar → **WhatsApp** → **API Setup**. Meta gives you a free **test number**.
2. In the **Send and receive messages** panel:
   - **From** dropdown = the test number; **Phone number ID** and
     **WhatsApp Business Account ID** are shown right below it — copy both.
   - Click **Generate access token** for a temporary (~24 h) token — fine for a first
     smoke test only.
3. Allowed recipients: in the **To** field click the dropdown → **Manage phone number
   list** → **Add phone number** → enter your own number → enter the SMS/WhatsApp
   verification code. Test numbers can message up to **5** verified recipients.
4. **Permanent token** (do this — temp tokens die daily):
   1. https://business.facebook.com → pick your business portfolio → click the
      **Settings** (gear) icon → this opens **Business settings**.
   2. Sidebar **Users → System users** → **Add** → name it (e.g. `fashionhub-bot`),
      role **Admin** → **Create system user**.
   3. Select it → **Assign assets** → **Apps** → pick your app → toggle **Manage app**
      (Full control) → Save. Repeat for **WhatsApp accounts** → your WABA → full control.
   4. Back on the system user → **Generate token** → choose the app → expiration
      **Never** → tick **whatsapp_business_messaging** and
      **whatsapp_business_management** → **Generate token** → copy it NOW (shown once).

→ `server` + `n8n` env: `WHATSAPP_PHONE_NUMBER_ID=...`, `WHATSAPP_ACCESS_TOKEN=<permanent token>`

### 5c. Instagram Messaging

1. You need an **Instagram professional account** (IG app → Settings → Account type
   and tools → **Switch to professional account** — Business or Creator).
2. Left sidebar → **Instagram** → **API setup with Instagram login**.
   - Section **1. Generate access tokens** → **Add account** → log in with the IG
     professional account → once listed, click **Generate token** next to it → approve
     scopes (**instagram_business_basic**, **instagram_business_manage_messages**) →
     copy the token. The number shown beside the account is the **Instagram account ID**.
3. Dev-mode testers: left sidebar **App roles → Roles** → **Add people** →
   **Instagram Tester** → enter the IG username. Accept the invite in the Instagram
   app: **Settings → Website permissions → Apps and websites → Tester invites**.

→ `server` env: `INSTAGRAM_ACCESS_TOKEN=...`, `INSTAGRAM_ACCOUNT_ID=...`

→ `server` env: `META_VERIFY_TOKEN=<any random string you choose>` (already generated
in Phase 4 — reuse the same value on Render).

### 5d. Webhooks (AFTER the server is live — step 7)

Server endpoint: `GET`+`POST https://fashionhub-api.onrender.com/api/webhooks/meta`.

1. **WhatsApp**: sidebar **WhatsApp** → **Configuration** → **Webhook** card → **Edit**
   → Callback URL = `https://fashionhub-api.onrender.com/api/webhooks/meta`, Verify
   token = your `META_VERIFY_TOKEN` → **Verify and save** (the server must already be
   deployed with that env var or verification fails). Then under **Webhook fields** →
   **Manage** → **Subscribe** to **messages**.
2. **Instagram**: sidebar **Instagram** → **API setup with Instagram login** → section
   **2. Configure webhooks** → same Callback URL + Verify token → save → subscribe to
   **messages**. (Also visible under the generic **Webhooks** product page — pick
   **Instagram** in the object dropdown there.)

> Dev-mode note: until App Review, only app roles / Instagram testers can message the
> IG bot, and WhatsApp only reaches the ≤5 verified recipients — fine for the demo.
> The web chat works for everyone regardless.

## 6. Supabase (free Postgres for n8n persistence) 👤

1. https://supabase.com → **New project** (free plan) → save the **database password**.
2. Click the **Connect** button at the top of the project dashboard. You'll see three
   connection types: **Direct connection**, **Transaction pooler**, **Session pooler**.
3. Use the **Session pooler** one (port **5432**). Why: Render's free tier is
   IPv4-only and Supabase's direct connection resolves to IPv6 (no free IPv4 add-on);
   the shared pooler in session mode is IPv4-compatible and supports everything n8n
   needs. Do NOT use the Transaction pooler (port 6543) — n8n needs session features.
4. From the Session pooler string note: host (`aws-0-<region>.pooler.supabase.com`),
   port `5432`, database `postgres`, user `postgres.<project-ref>`, password = the one
   you saved.

→ n8n service env (step 8): `DB_POSTGRESDB_HOST`, `DB_POSTGRESDB_DATABASE=postgres`,
`DB_POSTGRESDB_USER=postgres.<project-ref>`, `DB_POSTGRESDB_PASSWORD` (port 5432 is
preset in the Blueprint).

## 7. Render — deploy server + n8n via Blueprint 👤

`render.yaml` at the repo root defines BOTH services (`fashionhub-api` Node web
service + `fashionhub-n8n` from image `n8nio/n8n:latest`, both plan Free). One
Blueprint deploy creates them together.

1. https://render.com → sign in with GitHub → dashboard **+ New** → **Blueprint**.
2. **Connect** the `qatada16/fashionhub` repo → Render reads `render.yaml` and lists
   both services → give the Blueprint a name.
3. All env vars marked `sync: false` are **prompted on this screen before deploy** —
   fill them in:
   - `fashionhub-api`: `MONGODB_URI`, `JWT_SECRET` (any long random string),
     `CLIENT_URL` (Vercel URL — put a placeholder now, fix after step 9),
     `GEMINI_API_KEY`, `GROQ_API_KEY`, `CLOUDINARY_*` (3 vars),
     `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN` (permanent),
     `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_ACCOUNT_ID`, `META_APP_SECRET`,
     `META_VERIFY_TOKEN`, `N8N_WEBHOOK_BASE_URL` (= `https://fashionhub-n8n.onrender.com`).
   - `fashionhub-n8n`: see step 8.
4. **Deploy Blueprint**. Each service's public `https://<name>.onrender.com` URL is
   shown at the top of its service page — copy the api one for Meta webhooks (5d) and
   `VITE_API_URL` (step 9).
5. Seed the prod DB once: service **fashionhub-api → Shell** tab → `npm run seed`
   (or run locally with the Atlas `MONGODB_URI`).

To change an env var later: service → **Environment** tab → edit → **Save, rebuild,
and deploy**.

## 8. Render — finish n8n setup 👤

The service itself comes from the Blueprint; you only supply values + import workflows.

1. When prompted during Blueprint deploy (or later in the service's **Environment**
   tab): `DB_POSTGRESDB_HOST/DATABASE/USER/PASSWORD` (Supabase Session pooler, step 6),
   `N8N_ENCRYPTION_KEY` (any long random string — losing it orphans stored
   credentials), `WEBHOOK_URL=https://fashionhub-n8n.onrender.com`,
   `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_ACCESS_TOKEN` (same as server),
   `SERVER_URL=https://fashionhub-api.onrender.com`, `ADMIN_EMAIL` (your inbox),
   `FH_ADMIN_EMAIL=admin@fashionhub.pk`, `FH_ADMIN_PASSWORD=Admin@123`.
2. Open `https://fashionhub-n8n.onrender.com` → create the owner account.
3. Follow `n8n/README.md`: create the **FashionHub SMTP** credential (Brevo free),
   import the three JSONs from `n8n/workflows/` (**Workflows → Add workflow → ⋯ →
   Import from File…**), pick the SMTP credential in each Send Email node, toggle each
   workflow **Active**.

## 9. Vercel — deploy the frontend 👤

`client/vercel.json` already sets framework/build/SPA rewrites.

1. https://vercel.com → sign in with GitHub → dashboard **Add New…** → **Project** →
   **Import** `qatada16/fashionhub`.
2. On the configure screen: **Root Directory** → **Edit** → select `client`.
   Framework preset auto-detects **Vite** — leave build settings as-is.
3. Expand **Environment Variables** → add `VITE_API_URL` =
   `https://fashionhub-api.onrender.com` (no trailing slash) → **Deploy**.
4. Copy the production URL → set it as `CLIENT_URL` on the Render server service
   (Environment tab → save → redeploys).
5. If you ever change `VITE_API_URL`: Vercel env changes only apply to NEW builds —
   **Deployments** tab → ⋯ on the latest → **Redeploy**.

## 10. cron-job.org — keep-alive 👤

Render free services spin down after 15 min idle; two pings keep them warm.

1. https://cron-job.org → free sign-up → **Create cronjob**.
2. Job 1: Title `fashionhub-api`, URL `https://fashionhub-api.onrender.com/api/health`,
   Execution schedule → **Every 10 minutes** → **Create**. (Default request method GET
   is fine.)
3. Job 2: same, URL `https://fashionhub-n8n.onrender.com/healthz`.

## Environment Files

- `server/.env` — see `server/.env.example` (kept updated with every new var)
- `client/.env` — see `client/.env.example`
- Real `.env` files are **git-ignored**; only `.env.example` templates are committed.
- On Render, everything lives in each service's **Environment** tab (or the Blueprint
  prompt); no `.env` files are deployed.

## Deploy Order

Keys (1–4 ✅) → Meta app + tokens (5a–5c ✅) → GitHub push → Render Blueprint
(server + n8n, step 7) → seed prod DB → Meta webhooks (5d) → n8n workflows (8) →
Vercel client (9) → set `CLIENT_URL` on server → cron-job keep-alive (10).

## Post-deploy verification

1. Local, against prod env: `npm run check:meta` in `server/` — both channels PASS.
2. `curl https://fashionhub-api.onrender.com/api/health` → 200 (first hit after idle
   takes ~50 s cold start).
3. Open `https://<vercel-url>/chat` → send "Hi" → greeting menu appears; log into the
   dashboard with `admin@fashionhub.pk` / `Admin@123`.
4. Meta dashboard → WhatsApp → **Configuration** → webhook shows **Verified**
   (re-click **Verify and save** if you redeployed).
5. WhatsApp: message the test number from one of your ≤5 verified recipients → bot
   replies with the greeting list.
6. Instagram: DM the connected account from a tester account → bot replies.
7. n8n: `curl -X POST https://fashionhub-n8n.onrender.com/webhook/order-created -H
   "Content-Type: application/json" -d '{"orderId":"FH-TEST-1","customerName":"Test",
   "phone":"","items":[{"name":"Test","size":"M","qty":1}],"total":1,"city":"X",
   "channel":"web"}'` → 200 + admin email arrives (WhatsApp branch skipped: empty phone).
8. Place a real order via `/chat` → order appears in the dashboard and the
   confirmation email fires.
