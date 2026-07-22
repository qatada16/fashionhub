# Progress Log

Track every meaningful change here. Newest entries on top. Each work session appends:
date, what was built/changed, decisions made, and what's next.

## Phase Plan

- [x] **Phase 0 — Preparation** (2026-07-18): brief analyzed, architecture + docs written,
      agents/skills created, repo initialized.
- [x] **Phase 1 — Foundation** (2026-07-18): monorepo scaffolding, server skeleton (Express,
      Mongoose models, auth), client skeleton (Vite, Tailwind, design system, routing), seed data.
- [x] **Phase 2 — AI Engine** (2026-07-18): LangChain pipeline (intent + sentiment + tools +
      respond), provider fallback, web chat endpoint + UI, order-via-chat, browser E2E.
- [x] **Phase 3 — Admin Dashboard** (2026-07-18): products CRUD + Cloudinary upload, orders
      with status stepper, customers, conversations inbox, settings/Train-AI, CSV export,
      analytics — full browser E2E (vs in-memory Mongo; Atlas IP needs re-whitelisting).
- [x] **Phase 4 — Messaging Integrations** (2026-07-20): Meta webhook (signed, deduped),
      WhatsApp + Instagram adapters, Groq-Whisper voice transcription, n8n workflows
      (import-validated), order-hallucination bug fixed, tokens verified live.
- [~] **Phase 5 — Deploy & Polish** (2026-07-21, in progress): code + docs prep done
      (prod hardening, render.yaml Blueprint, vercel.json, API.md, DEPLOYMENT.md rewritten
      for 2026 UIs); remaining: user performs deploy clicks, then final live E2E.

## Log

### 2026-07-21 — Phase 5 prep: production-ready + deploy docs (deploy clicks pending)
- Verified user's new PERMANENT WhatsApp token + IG token: `npm run check:meta` PASS both.
- Server production hardening (`app.js`, `index.js`, `package.json`): `trust proxy 1`
  (rate-limit behind Render), CORS supports comma-list CLIENT_URL + any `*.vercel.app`
  (bad origins → 403 via HttpError-style status), SIGTERM/SIGINT graceful shutdown,
  `engines.node >=20`. Regression after changes: health/login/chat/CORS all pass; client
  prod build clean.
- Deploy configs: root `render.yaml` Blueprint (fashionhub-api Node + fashionhub-n8n
  image service, all secrets sync:false → prompted at deploy), `client/vercel.json`
  (Vite + SPA rewrites).
- Docs: NEW `docs/API.md` (27 endpoints, error envelope, chat contract enums, env
  appendix — written from actual code); `docs/DEPLOYMENT.md` fully rewritten against
  July-2026 UIs (researched live): Meta app creation now requires business portfolio,
  WhatsApp webhooks under WhatsApp→Configuration, permanent token via System users +
  asset assignment, Instagram all-in-one "API setup with Instagram login" page,
  Render Blueprint flow, Supabase Connect→Session pooler (IPv4 — Render free can't
  reach Supabase direct IPv6), Vercel root-dir import + redeploy-after-env gotcha.
  README links API.md + n8n README.
- NEXT PROMPT: user does DEPLOYMENT.md §7-10 clicks (Render Blueprint, n8n setup,
  Vercel, cron-job) + §5d Meta webhook config; then run final live E2E: check:meta,
  prod seed, /chat on Vercel, WhatsApp message from allowed recipient, IG DM from
  tester, n8n order-confirmation, dashboard on live API, keep-alive verify.

### 2026-07-20 — Phase 4 complete: verified + critical order bug fixed
- **Bug (user-reported)**: chat claimed "order placed" but no order existed. Cause: user
  sent phone + address in ONE message while flow was awaiting `phone` — address dropped
  (only parsed when awaiting `address`), order stayed incomplete, respond-LLM
  hallucinated success. Fixed in `engine.js`: opportunistic capture of phone/name/address
  from any order-flow message (ADDRESS_RE detection, phone stripped first) + explicit
  "order NOT placed yet, never claim it is" instruction; `respond.js` rule: only claim
  placed when data has `orderConfirmed` (always state orderId). Reproduced user's exact
  scenario against Atlas → FH-2026-0003 created correctly. User's stuck conversation
  recovers by re-sending the address.
- **Search verified** (paraphrase battery vs Atlas): "something elegant to wear at a
  wedding" → party/formal wear; Roman Urdu "kuch acha sa casual men k liye" → men's
  casual shirts; "cheap sneakers under 3k" → shoes ≤ Rs 3000; "bag that goes with formal
  wear" → Office Satchel. Design is LLM entity-extraction + deterministic Mongo (not
  embeddings) — right free-tier trade-off, fully grounded.
- **Phase 4 verification (mine, on top of agents')**: n8n JSONs schema-checked + agent's
  real `n8n import:workflow` pass; webhook smoke vs Atlas: handshake 200/403, unsigned
  401, signed WA payload → EVENT_RECEIVED → engine → send attempted (Meta 131030 for
  fake recipient = correctly formed call), /api/chat regression passed. Meta env vars +
  generated META_VERIFY_TOKEN wired into server/.env; `npm run check:meta` PASS both
  channels (WA test number, IG @qatadingz).
- Next: Phase 5 — deploy (Render server + n8n, Vercel client, Meta webhook config §5d,
  n8n env/credential setup, keep-alive), API docs, README polish, final E2E.

### 2026-07-20 — Phase 4 integrations: Meta webhook + WhatsApp/Instagram adapters + voice

- Unified Meta webhook `GET/POST /api/webhooks/meta` (`routes/webhooks.routes.js`):
  verify-token handshake, `X-Hub-Signature-256` HMAC over raw body (new `verify`
  callback in app.js stashes `req.rawBody`), instant 200 `EVENT_RECEIVED` + setImmediate
  async processing, in-memory 500-id LRU dedupe, routes by `body.object`.
- Channel adapters `src/channels/`: `whatsapp.js` (parse text/audio/interactive
  incl. list_reply/button_reply; send text, interactive LIST greeting menu ["FashionHub
  Menu" section], up to 4 image product cards with price/discount captions + text-digest
  fallback, order confirmation, mark-read, media download via GET /<MEDIA_ID> → bearer
  fetch), `instagram.js` (parse DMs via entry.messaging, skip is_echo/own-account;
  send text with numbered quick-reply lines, image `attachment` + caption line — note:
  IG rejects plural `attachments`, found live), `dispatcher.js` (audio → download →
  transcribe → `handleChatMessage` → channel sends; all failures logged, never thrown).
- Voice `src/ai/transcribe.js`: Groq `whisper-large-v3-turbo` multipart primary →
  Gemini inlineData fallback → null → bilingual "couldn't hear" reply from dispatcher.
- n8n glue `services/n8n.service.js`: fire-and-forget `notifyN8n(event, payload)`
  (no-op + debug log when `N8N_WEBHOOK_BASE_URL` unset); engine now emits
  `order-created` (from advanceOrderFlow success) and `complaint-received`.
- `npm run check:meta` (`scripts/check-meta.js`): both tokens PASS live (WA test number
  +1 555-169-1728 "Test Number"; IG @qatadingz). Graph version env-overridable via
  `META_GRAPH_VERSION` (default v25.0). `.env.example` updated.
- Live-tested against Atlas: handshake 200/403, unsigned + bad-signature POST → 401,
  signed WA text "Hi" → engine ran, greeting LIST send attempted (Meta 131030
  "recipient not in allowed list" — expected for fake sender, logged gracefully),
  duplicate wamid skipped, list_reply "Delivery Information" → delivery_query intent,
  fake-media audio → graceful voice fallback attempt, IG text → product_search;
  whatsapp + instagram customers/conversations verified in Mongo; POST /api/chat
  regression passed.
- For live traffic user must configure Meta app webhooks (callback URL
  `<host>/api/webhooks/meta`, verify token = META_VERIFY_TOKEN, subscribe WhatsApp
  `messages` field + Instagram `messages`) and add tester recipients.
- Next: n8n workflow JSONs + Phase 5 deploy.

### 2026-07-20 — Phase 4 (n8n): automation workflows authored

- Created `n8n/workflows/` with three importable workflow JSONs (core nodes only —
  Webhook v2, Set v3.4, IF v2.2, HTTP Request v4.2, Send Email v2.1, Schedule v1.2):
  - `order-confirmation.json` — `POST /webhook/order-created` → format confirmation →
    IF phone non-empty → WhatsApp Cloud API send (`graph.facebook.com/v21.0/
    {{$env.WHATSAPP_PHONE_NUMBER_ID}}/messages`, Bearer `{{$env.WHATSAPP_ACCESS_TOKEN}}`);
    parallel branch emails the admin a new-order alert. Webhook ACKs 200 immediately
    (responseMode onReceived) regardless of branch outcomes.
  - `admin-notify.json` — `POST /webhook/complaint-received` → complaint summary email
    to `{{$env.ADMIN_EMAIL}}`. (Admin order email lives in order-confirmation because
    two active workflows cannot share one webhook path in n8n.)
  - `daily-sales-report.json` — Schedule 20:00 Asia/Karachi → login
    `{{$env.SERVER_URL}}/api/auth/login` (FH_ADMIN_EMAIL/FH_ADMIN_PASSWORD) → JWT →
    GET `/api/admin/stats` → today (salesByDay.last()) + all-time + top product +
    low-stock summary → email admin.
- No secrets in JSON: everything via `$env` expressions + one named SMTP credential
  placeholder "FashionHub SMTP" (Brevo/Gmail setup steps in `n8n/README.md`, along
  with import steps, Render env vars, and curl-based local test commands).
- Validated: all three JSONs parse and match the export schema (nodes have
  id/name/type/typeVersion/position/parameters; all connections resolve).
- ACTION (user): after deploying n8n (DEPLOYMENT §8), set env vars
  WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, SERVER_URL, ADMIN_EMAIL,
  FH_ADMIN_EMAIL, FH_ADMIN_PASSWORD on the n8n service; create the "FashionHub SMTP"
  credential; import + activate the workflows; set N8N_WEBHOOK_BASE_URL on the server.

### 2026-07-18 — Phase 3 complete: integration verified end-to-end
- **Atlas blocker**: user's public IP (39.62.216.42) is no longer on the Atlas access
  list — all live DB access fails. ACTION (user): Atlas → Network Access → add
  0.0.0.0/0. Integration testing proceeded on `npm run dev:memory` (new script:
  mongodb-memory-server on :27099 + seed; `runSeed()` exported from seed/index.js,
  connectDB now idempotent).
- Generated real data through the live AI chat: full order conversation (greeting →
  product → qty → name → phone → address) created FH-2026-0001 (Rs 5,850, free
  delivery) + a complaint conversation classified complaint/frustrated.
- Browser E2E passed across the whole dashboard: stats cards show real revenue
  (Rs 5,850) + recent order; products create-with-Cloudinary-upload → search → edit →
  delete round-trip (toasts, confirm dialog); order drawer status pending→confirmed via
  stepper; customers list + drawer; conversations inbox (2 threads, intent/sentiment
  badges in thread pane); settings persona save persists after reload; orders CSV
  download (fashionhub-orders-2026-07-18.csv); dark theme verified. Phase 2 /chat
  regression re-passed in full.
- Flake found+fixed in test only: framer-motion dirty-badge animation makes settings
  Save unstable for Playwright — force-click + persistence assert; first "save" had NOT
  persisted, re-verified with a clean cycle (real UI save works).
- Next: Phase 4 — Meta webhook endpoint, WhatsApp/Instagram adapters, voice
  transcription, n8n workflows (needs user's Meta app + tokens per docs/DEPLOYMENT.md §5).

### 2026-07-18 — Phase 3 backend: admin APIs live-tested

- New JWT-guarded endpoints (all zod-validated, routes/controllers/services layers):
  `GET /api/admin/stats` (revenue excl. cancelled, counts, ordersByStatus, 14-day
  salesByDay zero-filled, top-5 topProducts, latest-5 recentOrders, lowStock ≤5);
  `GET/GET:id/PATCH /api/admin/orders` (page/status/paymentStatus/channel/search on
  orderId + customer name; PATCH auto-generates `TRK-XXXXXXXX` when status→shipped
  without tracking); `GET/GET:id /api/admin/customers` (search name/phone/instagramId,
  channelHint, ordersCount via aggregate, detail includes order list);
  `GET/GET:id/PATCH /api/admin/conversations` (channel/isOpen filters, lastMessage
  truncated 120, lastIntent/lastSentiment from last classified customer message,
  PATCH toggles isOpen); `POST /api/admin/uploads` (multer memory, 5MB,
  jpeg/png/webp → Cloudinary `fashionhub/products`, returns `{url (f_auto,q_auto),
  publicId}`); `GET /api/admin/export/:type` orders|customers|products CSV attachment
  via tiny `utils/csv.js` (quote/comma/newline escaping); `GET /api/admin/settings` +
  `PUT /api/admin/settings/:key` (per-key zod shapes).
- Settings shape alignment: seed + validation now use `policies {returnPolicy,
  exchangePolicy, refundProcess}` and `persona {brandVoice, extraInstructions,
  greeting}`; settings service normalizes the legacy Atlas doc keys on read;
  `respond.js` now appends `persona.extraInstructions` to the system prompt so
  Train-AI edits flow into live replies. Deps added: `cloudinary`, `multer`
  (+ dev `mongodb-memory-server`). No new env vars (CLOUDINARY_* already present).
- Verification: Atlas was unreachable from this network (DNS blocks mongodb.net +
  current IP 39.62.216.42 not on the Atlas access list → TLS alert 80). Tested live
  against mongodb-memory-server on :27099 instead: ran seed + realistic fixtures
  (3 customers/orders/conversations mirroring Phase 2 data). All endpoints verified
  via curl: stats math, order pending→confirmed→shipped with auto tracking, searches
  and filters, conversation intents/sentiments, real Cloudinary upload (HEAD 200,
  asset deleted after), 3 CSV downloads with correct headers, settings PUT persona +
  persistence + 400s on bad shapes/keys. Regression: health, login, 401 guard,
  admin products, POST /api/chat "Hi" (greeting menu) all pass.
- ACTION NEEDED for Atlas work from this machine: add current IP (or 0.0.0.0/0 for
  demo) to the Atlas access list; local DNS refuses mongodb.net lookups (works via
  8.8.8.8), so dev may need a DNS override.

### 2026-07-18 — Phase 3 (frontend): full admin dashboard UI

- All six dashboard pages built against the agreed `/api/admin` contract (backend in
  parallel); every page degrades gracefully offline: skeletons → retryable error state.
- **Dashboard**: 4 StatCards (Revenue Rs, Orders, Customers, Conversations + open count),
  14-day sales bar chart as hand-rolled inline SVG (token fills, hover tooltip with
  date/orders/total — no chart library), top products list, recent orders mini-table
  (row click → `/orders?open=<id>` drawer), warn-toned low-stock card when non-empty.
- **Products**: thumbnail column, "-x%" discount badge, Active/Inactive pill, category
  filter chips + 300ms-debounced search (both sync to URL query params), pagination;
  slide-over product form drawer (240ms framer-motion, full-screen <640px) with all
  schema fields — selects, sizes chip-toggles, colors chip input, stock matrix rows,
  drag/drop image uploader → POST /uploads with preview/reorder/remove, trending/active
  switches — plus create/edit/delete (ConfirmDialog) with invalidation + toasts.
- **Orders**: serif orderId, channel icons (MessageCircle/Instagram/Globe), status
  badge tone mapping, status filter chips + search, detail drawer with item images,
  totals breakdown, address, clickable 5-step status stepper (PATCH per step),
  cancel/return actions, paymentStatus select, inline tracking-number editor.
- **Customers**: table with channel icon, contact, city, orders count, language badge;
  drawer with profile, preference chips (color swatch dots via stylesheet classes —
  no inline styles), order history linking into the order drawer.
- **Conversations**: two-pane inbox (320px list / thread; <768px list↔thread with back
  button), channel + open-only filters, unread dot, intent/sentiment mini-badges,
  30s refetchInterval; thread reuses /chat bubble styling with intent/sentiment captions
  under customer messages, product snapshots, Open/Closed toggle (PATCH isOpen).
- **Settings (Train AI)**: Persona, Policies, Delivery (charges/freeAbove + editable
  cities table with same-day switch), FAQ pair rows — per-section Save → PUT
  /settings/:key with dirty-state "Unsaved changes" badge + saved toast.
- **Export CSV** ghost buttons (Download icon) on Products/Orders/Customers via axios
  blob + object URL.
- New shared primitives: Drawer, ConfirmDialog, Toast (module-store, bottom-right,
  3s auto-dismiss), Select, Textarea, Switch, Pagination, FilterChips, ChannelIcon,
  ExportButton; Badge gained `accent` tone; Table THead/TRow hardened; libs:
  format.js, status.js (tone maps), useDebounce. Fixed TanStack v5 API
  (`placeholderData: keepPreviousData`).
- `npm run build` zero errors; dev boots. E2E hooks: `stat-cards`/`stat-*`,
  `product-row`, `add-product`, `product-drawer`, `field-*`, `product-save`,
  `product-delete`, `order-row`, `order-drawer`, `status-step-<status>`,
  `conversation-item`, `thread-pane`, `conversation-toggle`, `save-persona|policies|
  delivery|faq`, `export-products|orders|customers`, `toast`, `confirm-action`.
- Needs backend (contract as specified): GET /stats, orders list/detail/PATCH,
  customers list/detail, conversations list/detail/PATCH, POST /uploads,
  GET /export/:type, GET/PUT settings.

### 2026-07-18 — Phase 2 complete: integration verified + fixes
- Browser E2E (Playwright) on /chat: welcome chips, exact 5-item greeting menu, product
  cards with strikethrough discount pricing (Black Embroidered Maxi Rs 6,500 → Rs 5,850),
  grounded Islamabad delivery reply (Rs 200 / 2 days / free ≥ Rs 5,000), quick-reply
  clicks, New chat reset, dark mode. Phase 1 regression (login → products → theme) passed.
- Fixed: strict intent enum rejected synonym intents from Groq JSON mode (e.g. "browse")
  → whole classification failed → canned fallback. `understand.js` now uses lenient
  string schemas for Groq + `normalizeClassification()` (alias map browse→product_search
  etc., unknown sentiment→neutral, language coercion). Order intent re-verified after fix.
- Gemini model quota discovery (key-specific): this key has `limit: 0` (NO free quota)
  for gemini-2.0-flash; 2.5-flash quota is tiny and was exhausted; `gemini-flash-lite-latest`
  responds 200. `GEMINI_MODEL=gemini-flash-lite-latest` set in server/.env. Groq fallback
  carries load seamlessly when Gemini 429s (proven live repeatedly).
- User added Cloudinary credentials → wired into server/.env (used in Phase 3 uploads).
- Next: Phase 3 — Admin Dashboard (products CRUD UI + image upload, orders, customers,
  conversations inbox with intent/sentiment labels, settings/Train-AI, export, analytics).

### 2026-07-18 — Phase 2 backend: AI conversation engine live-tested

- Built `server/src/ai/`: `llm.js` (Gemini 2.5 Flash → Groq Llama 3.3 70B fallback wrapper,
  429/error tolerant), `understand.js` (one structured-output call → intent/sentiment/
  language/entities, with deterministic entity augmentation: category keywords, colors,
  "under Rs X"), `tools.js` (pure Mongoose: searchProducts with progressive filter
  relaxation, checkStock, getDeliveryInfo, getPolicies/getFaq/getPersona, trackOrder,
  getTrending, getUpsells, createOrder with FH-YYYY-NNNN ids, city-based delivery charges,
  freeAbove, atomic stock decrement), `respond.js` (grounded composing call, persona +
  sentiment tone + language mirroring, strict no-invention rules), `engine.js`
  (orchestration, greeting menu + quickReplies, deterministic menu-number mapping,
  multi-turn pendingOrder state machine on the conversation doc, preference learning).
- Endpoints: `POST /api/chat` (zod: uuid sessionId, 1-1000 char message; rate-limited
  20/min/IP via express-rate-limit, override with CHAT_RATE_LIMIT_PER_MIN) and
  `GET /api/chat/:sessionId/history`. Conversation model gained `pendingOrder`,
  `context.lastProductIds/lastEntities`, and message `products` snapshots.
- Provider quirks solved: Gemini response_schema rejects type unions → strict optional
  schema for Gemini function-calling; Groq server-side tool validation is brittle
  (nulls, string numbers, stringified arrays, extra keys) → JSON mode + lenient
  client-side zod schema for Groq. Fallback unit-tested (bogus Gemini model → Groq
  answered) and proven live: Gemini 2.5 Flash free tier is only ~20 req/DAY — quota
  exhausted mid-testing, Groq served everything after with zero endpoint failures.
- Live tests (all via curl against Atlas): greeting menu, "black dress for Eid" (Black
  Embroidered Maxi Rs 6500 -10%), "shoes under Rs 3000" (4 correct matches), "Do you
  have XL?" context follow-up with stock counts, Lahore delivery (Rs 150/1 day),
  return policy, discounts, trending, Roman Urdu reply in Roman Urdu, angry-parcel
  apology + human handoff. Two full chat orders placed: FH-2026-0001 (Red Party Frock M,
  Rs 5200, free delivery >5000, incl. change-of-mind mid-flow) and FH-2026-0002 (2x Beige
  Lawn Kurti L, Rs 3060+250 Karachi = 3310). Verified in Mongo: totals, stock decrements
  (8→7, 8→6), soldCount bumps, customer prefs/language, trackOrder finds both.
- Latency: ~2-6s per message (2 LLM calls); Groq ≈1-2s/call, Gemini ≈2-3s/call.
- Known rough edges: Groq occasionally suggests an extra product despite the grounding
  rule (mostly tamed); one legacy test customer has an address stored as name (guard
  added since). Consider GEMINI_MODEL=gemini-2.0-flash (200 RPD free) for demos.
- Next: Phase 3 dashboard (conversations inbox can reuse message intents/sentiments).

### 2026-07-18 — Phase 2 (frontend): public web chat UI

- Public route `/chat` (no auth, outside dashboard shell) with minimal header: serif
  wordmark → /chat, "AI Sales Assistant" tagline, New chat, theme toggle, Admin → /login.
- Chat per design system: customer bubbles surface-2 left, assistant accent-tinted right,
  160ms slide-in from sender side with reduced-motion guard, typing indicator (three
  bouncing accent dots), quick-reply chips (ghost pills, accent border on hover,
  fade-stagger) under the latest assistant message, welcome state with 5 starter chips
  (incl. Urdu), horizontal product mini-card row (3/4 lazy image, serif name,
  strikethrough + discounted `Rs x,xxx` when discount% > 0, tap sends "Tell me more
  about `<name>`"), success-tinted order confirmation card (serif orderId + total).
- Session: `crypto.randomUUID()` in localStorage `fh-chat-session`; history loaded on
  mount (GET `/api/chat/:sessionId/history`) with skeleton bubbles; New chat resets both.
- Sends via TanStack useMutation (POST `/api/chat`), optimistic customer bubble, failed
  sends keep the bubble with a Retry affordance and restore text to input; smart
  auto-scroll (only when near bottom); textarea autosizes 1-4 rows via
  `field-sizing-content`, Enter sends / Shift+Enter newline.
- Files: `client/src/features/chat/*` (ChatPage, MessageBubble, ProductMiniCard,
  OrderCard, QuickReplies, TypingIndicator, ChatInput, session, format),
  `client/src/api/chat.js`, route added in `App.jsx`. `npm run build` + dev boot verified.
- E2E hooks: `[data-testid="chat-input"|"chat-send"|"quick-reply"|"product-card"|
  "new-chat"|"retry-send"|"message-customer"|"message-assistant"|"order-card"]`.

### 2026-07-18 — Phase 1 complete: integration verified
- Server skeleton live-tested against Atlas: auth (login/me/401 guard), admin products
  CRUD with zod validation + pagination/search, public products API. Seeded 42 products,
  1 admin (admin@fashionhub.pk), 4 settings docs.
- Fixed client/server contract: products list returns `{ items, page, total, totalPages }`
  (client hook updated from `data.products` to `data.items`).
- Fixed React crash on Products page: `product.stock` is an array of `{size,color,qty}`
  — now summed via `totalStock()`. Added route-level ErrorBoundary in DashboardLayout so
  a page crash can never white-screen the whole app.
- Full browser E2E via Playwright: login → dashboard redirect, Products renders 20 rows
  (page 1 of 42), dark/light toggle applies `.dark`, screenshots verified in both themes.
- Phase 1 marked done. Next: Phase 2 (AI engine) — needs GEMINI_API_KEY + GROQ_API_KEY.

### 2026-07-18 — Phase 1 (client skeleton)
- Scaffolded `client/`: Vite + React 18 (JS), Tailwind v4 via `@tailwindcss/vite`,
  TanStack Query, zustand, axios, framer-motion, lucide-react, cva/clsx,
  self-hosted Fraunces + Inter via @fontsource.
- Design-system tokens in `src/index.css` (`@theme` + `.dark` overrides); theme store
  (persisted, follows `prefers-color-scheme`) with sun/moon toggle in topbar.
- Auth: persisted zustand store, axios instance with Bearer interceptor + 401 → logout,
  login page (POST `/api/auth/login`), protected routes.
- Dashboard shell: sidebar (icons-only <1024px, bottom bar <640px), topbar (title,
  theme toggle, admin menu), 180ms fade+rise route transitions with reduced-motion guard.
- Placeholder pages for Dashboard/Products/Orders/Customers/Conversations/Settings;
  Products fetches GET `/api/admin/products` with skeleton table + error/empty states.
- Shared primitives: Button, Card, StatCard, Table, Badge, Input, Skeleton, EmptyState,
  PageHeader. `npm run build` and `npm run dev` verified.
- Next: server skeleton endpoints `POST /api/auth/login` → `{token, admin}` and
  `GET /api/admin/products` → array (or `{products: []}`).

### 2026-07-18 — Phase 0: Preparation
- Read `fashionhub.pdf` (CodeCelix brief) and extracted all requirements.
- Verified free tiers: Render (750h/mo, 15-min spin-down), Gemini Flash (~1500 req/day),
  WhatsApp Cloud API (free test number, 1000 service convos/mo), Instagram API dev mode.
- Decisions: Gemini primary + Groq fallback (brief says OpenAI, but $0 budget → free
  providers; LangChain still used as mandated). n8n self-hosted on Render with Supabase
  Postgres (Render free has no persistent disk). Web chat demo added so evaluators can
  test without Meta tester setup.
- Created: PROJECT-BRIEF, ARCHITECTURE, DATABASE-SCHEMA, DEPLOYMENT, CLAUDE.md,
  subagents (frontend/backend/ai-workflow/integrations), design-system skill, git repo.

## 2026-07-18 — Backend Phase 1 (server skeleton)

- Scaffolded `server/` (Express + Mongoose, ES modules, layered routes/controllers/services/models).
- Models: Product, Customer, Order, Conversation, Setting, Admin per DATABASE-SCHEMA.md (text index on product name+description; indexes on category/gender/price; lastMessageAt index).
- Endpoints: GET /api/health; POST /api/auth/login (JWT 7d), GET /api/auth/me; /api/admin/products CRUD + list (search/category/gender/page/limit/sort, zod-validated); public GET /api/products (active only, filterable) and GET /api/products/:slug. JWT middleware guards all /api/admin/*.
- Seed (`npm run seed`): 42 products (all categories/genders/seasons/styles, Rs 1,500-8,000, Unsplash placeholders), 1 admin (admin@fashionhub.pk), 4 settings docs (policies, delivery, persona, faq).
- Verified against Atlas: seed inserted; health, login, me, admin list, auth guard (401), public filters, slug fetch, create+validate+delete round-trip all pass.
