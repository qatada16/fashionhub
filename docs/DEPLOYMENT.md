# Deployment & API Keys Guide

Everything below is **$0**. Steps marked 👤 are the ones YOU (Qudama) do; everything
else is code/config Claude handles. Do the 👤 steps in order — later ones depend on earlier URLs.

## 1. MongoDB Atlas (database) 👤

1. https://cloud.mongodb.com → sign up (Google login works) → create **M0 Free** cluster
   (region: any close one, e.g. Mumbai/Frankfurt).
2. Database Access → Add New Database User → username + password (save them).
3. Network Access → Add IP → **0.0.0.0/0** (allow from anywhere — Render IPs rotate).
4. Connect → Drivers → copy the connection string, fill in the password.

→ `.env`: `MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/fashionhub`

## 2. Google Gemini API (primary AI) 👤

1. https://aistudio.google.com/apikey → Create API key (free, no card).

→ `.env`: `GEMINI_API_KEY=...`

## 3. Groq (fallback AI) 👤

1. https://console.groq.com → sign up → API Keys → Create.

→ `.env`: `GROQ_API_KEY=...`

## 4. Cloudinary (product images) 👤

1. https://cloudinary.com → free sign up → Dashboard shows Cloud name, API Key, API Secret.

→ `.env`: `CLOUDINARY_CLOUD_NAME=...`, `CLOUDINARY_API_KEY=...`, `CLOUDINARY_API_SECRET=...`

## 5. Meta App — WhatsApp + Instagram 👤

One Meta app serves both channels.

### 5a. Create the app
1. https://developers.facebook.com → My Apps → Create App → use case **"Other"** →
   type **Business**.
2. App Dashboard → Add Products → add **WhatsApp** and **Instagram**.

### 5b. WhatsApp Cloud API
1. WhatsApp → API Setup: Meta gives you a **free test phone number**.
2. Copy: **Phone number ID**, **WhatsApp Business Account ID**, **temporary access token**
   (later: generate a permanent token via Business Settings → System Users → Add →
   assign app → Generate Token with `whatsapp_business_messaging` permission).
3. Add your own phone as a recipient (test numbers can message up to 5 verified numbers).

→ `.env`: `WHATSAPP_PHONE_NUMBER_ID=...`, `WHATSAPP_ACCESS_TOKEN=...`

### 5c. Instagram Messaging
1. You need an **Instagram professional account** (free: Instagram app → Settings →
   Account type → switch to Business/Creator) linked to a **Facebook Page** (create one free).
2. App Dashboard → Instagram → connect the account; add yourself as **Instagram Tester**
   (App Roles) and accept the invite in the Instagram app (Settings → Apps and Websites).
3. Generate a token with `instagram_business_basic`, `instagram_business_manage_messages`.

→ `.env`: `INSTAGRAM_ACCESS_TOKEN=...`, `INSTAGRAM_ACCOUNT_ID=...`

### 5d. Webhooks (after the server is deployed — step 7)
1. App Dashboard → Webhooks: callback URL `https://<render-server-url>/api/webhooks/meta`,
   verify token = the `META_VERIFY_TOKEN` value we set (any random string you choose).
2. Subscribe to `messages` fields for both WhatsApp and Instagram.

→ `.env`: `META_VERIFY_TOKEN=<random string>`, `META_APP_SECRET=` (App Settings → Basic)

> Dev-mode note: only tester accounts can message the Instagram bot until Meta App Review —
> fine for the internship demo. The web chat demo works for everyone regardless.

## 6. Supabase (free Postgres for n8n persistence) 👤

1. https://supabase.com → New project (free) → save the DB password.
2. Project Settings → Database → connection info (host, port 5432, user, db name).

Used only as n8n's backend DB (env vars set on the n8n Render service, step 8).

## 7. Render — deploy the server 👤 (guided)

1. https://render.com → sign up with GitHub → New → Web Service → pick `qatada16/fashionhub`.
2. Root directory `server`, build `npm install`, start `npm start`, instance type **Free**.
3. Paste all server `.env` values in the Environment tab.
4. Copy the public URL → used for Meta webhooks (5d) and the frontend env.

## 8. Render — deploy n8n 👤 (guided)

1. New → Web Service → **Existing image**: `n8nio/n8n:latest`, instance **Free**.
2. Env vars: `DB_TYPE=postgresdb`, `DB_POSTGRESDB_HOST/PORT/DATABASE/USER/PASSWORD`
   (from Supabase), `N8N_ENCRYPTION_KEY=<random>`, `WEBHOOK_URL=<n8n render url>`,
   `N8N_PORT=10000`.
3. Open the n8n URL → create owner account → import workflows from `n8n/workflows/*.json`.

## 9. Vercel — deploy the frontend 👤 (guided)

1. https://vercel.com → sign up with GitHub → Import `qatada16/fashionhub`.
2. Root directory `client`, framework Vite. Env: `VITE_API_URL=<render server url>`.

## 10. cron-job.org — keep-alive 👤

1. https://cron-job.org → free account → two jobs, every 10 minutes:
   `GET <server-url>/api/health` and `GET <n8n-url>/healthz`.

## Environment Files

- `server/.env` — see `server/.env.example` (created with the code)
- `client/.env` — see `client/.env.example`
- Real `.env` files are **git-ignored**; only `.env.example` templates are committed.

## Deploy Order

MongoDB → AI keys → Cloudinary → GitHub push → Render server → Meta app + webhooks →
Supabase → Render n8n → Vercel client → cron-job keep-alive → seed DB (`npm run seed`).
