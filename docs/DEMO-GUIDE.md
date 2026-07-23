# FashionHub — Demo & Presentation Guide

Live URLs:

- **Web app (landing + chat + admin):** https://fashion-hub16.vercel.app
- **API:** https://fashionhub-api-xq5h.onrender.com (`/api/health` to wake it)
- **n8n automations:** https://fashionhub-n8n.onrender.com
- **Repo:** https://github.com/qatada16/fashionhub

Admin login: `admin@fashionhub.pk` / `Admin@123`

> ⏱ 10 minutes before presenting: open `/api/health` once (Render free tier cold-starts
> ~50s), open the Vercel site, and log into the dashboard — everything stays warm after.

## Suggested 10-minute demo flow

1. **Landing page** (30s) — the product pitch, dark/light toggle, responsive.
2. **Web chat as a customer** (3 min) — on `/chat`:
   - "Hi" → greeting menu (the brief's exact 5 options).
   - "I need a black dress for Eid" → grounded product cards with real prices/discounts.
   - "shoes under Rs 3000" → budget filtering. "Do you have XL?" → context follow-up.
   - "aap ke pass red dress hai?" → Roman Urdu reply.
   - Place a full order: "I want to order the black maxi in M" → follow prompts
     (qty → name → phone → address) → order confirmation card with order ID.
   - "track my order" → live status.
3. **WhatsApp** (1 min) — message the test number from a verified phone: "Hi" shows the
   interactive list menu; "show me handbags" sends product image cards. Voice note →
   transcribed and answered.
4. **Instagram** (1 min) — DM @qatadingz from a tester account → same AI answers.
5. **Admin dashboard** (3 min) — log in:
   - Dashboard: revenue, 14-day chart, top products, the order just placed.
   - Orders: open it, advance status via the stepper (auto tracking number on Shipped).
   - Conversations: the chat you just had, with intent + sentiment labels per message.
   - Customers: profile auto-built with learned preferences (colors, sizes, budget).
   - Products: create one with a drag-drop Cloudinary image upload.
   - Settings → Train AI: change the brand voice, save, then send another chat message —
     the tone changes live.
   - Export CSV from Orders.
6. **Automations** (1 min) — show n8n workflows: order-created → WhatsApp confirmation +
   admin email; complaint → admin email; daily 8 PM sales report.

## Talking points (what makes it solid)

- **Grounded AI**: product facts always come from MongoDB via tools — the model cannot
  invent prices or stock. Intent + sentiment + language detected per message.
- **Resilient free-tier design**: Gemini primary → Groq fallback → safe reply; webhooks
  ACK in <1s and process async; keep-alive pings defeat Render spin-down.
- **One AI engine, three channels**: web, WhatsApp, Instagram share the same pipeline.
- **Security**: webhook HMAC signature verification, JWT admin auth, zod validation,
  rate limiting, no secrets in git.
- **Stack**: React + Tailwind, Node + Express, MongoDB Atlas, LangChain.js, n8n,
  Meta Cloud APIs — total hosting cost: Rs 0.

## Health checklist before the demo

| Check | How |
|---|---|
| API awake | `https://fashionhub-api-xq5h.onrender.com/api/health` → `{"status":"ok"}` |
| Tokens valid | `npm run check:meta` in `server/` → both PASS |
| Webhooks verified | Meta app → WhatsApp → Configuration → webhook "Verified" |
| n8n workflows | n8n UI → all three toggled **Active** |
| Cron warm-up | cron-job.org dashboard → both jobs green |

## Known dev-mode limits (say them before anyone asks)

- WhatsApp test number only messages ≤5 verified recipients; Instagram only responds to
  app testers — production removes both via Meta App Review (a form, not code).
- First request after long idle can take ~50s (Render free cold start) — the keep-alive
  crons make this rare.
