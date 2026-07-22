# FashionHub API Reference

REST API for the FashionHub AI Fashion Sales Assistant server (`server/`).

## 1. Overview

### Base URL

| Environment | Base URL |
|---|---|
| Local | `http://localhost:5000/api` |
| Production | `https://<your-render-service>.onrender.com/api` |

All routes below are relative to the base URL.

### Authentication

- Obtain a JWT via `POST /auth/login`. Tokens expire in 7 days.
- Send it as `Authorization: Bearer <token>`.
- Every route under `/admin/*` requires a valid token; missing/invalid tokens return `401 { "error": "Authentication required" }` or `401 { "error": "Invalid or expired token" }`.
- Public routes (health, products, chat, webhooks) need no auth.

### Error envelope

The central error middleware always returns JSON:

```json
{ "error": "Human-readable message" }
```

Variants:

- Validation failure (zod, status 400):
  ```json
  {
    "error": "Validation failed",
    "details": [{ "path": "body.email", "message": "Invalid email" }]
  }
  ```
- Duplicate key (status 409): `{ "error": "Duplicate value", "fields": ["slug"] }`
- Invalid ObjectId cast (status 400): `{ "error": "Invalid id" }`
- Oversized upload (status 400): `{ "error": "Image too large (max 5MB)" }`
- Unknown route (status 404): `{ "error": "Not found" }`

### Rate limiting

`POST /chat` is limited per IP to `CHAT_RATE_LIMIT_PER_MIN` requests per minute (default 20). Standard draft-7 `RateLimit` headers are sent. When exceeded:

```json
{ "error": "Too many messages, please slow down a little." }
```

### CORS

Origins allowed: `CLIENT_URL` (comma-separated list), `http://localhost:5173`, and any `*.vercel.app` host.

---

## 2. Health

### GET /health

Auth: none.

```bash
curl http://localhost:5000/api/health
```

```json
{ "status": "ok", "uptime": 123.45 }
```

---

## 3. Auth

### POST /auth/login

Auth: none.

Body:

| Field | Type | Constraints |
|---|---|---|
| `email` | string | valid email |
| `password` | string | min 1 char |

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fashionhub.pk","password":"secret"}'
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": { "id": "6650...", "name": "Admin", "email": "admin@fashionhub.pk", "role": "admin" }
}
```

Wrong credentials return `401 { "error": "Invalid credentials" }`.

### GET /auth/me

Auth: Bearer token.

```bash
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer $TOKEN"
```

```json
{ "admin": { "id": "6650...", "name": "Admin", "email": "admin@fashionhub.pk", "role": "admin" } }
```

---

## 4. Public Products

### GET /products

Auth: none. Returns only `isActive: true` products.

Query params:

| Param | Type | Constraints / values |
|---|---|---|
| `search` | string | full-text search |
| `category` | enum | `dresses`, `shirts`, `shoes`, `handbags`, `accessories` |
| `gender` | enum | `men`, `women`, `unisex` |
| `season` | enum | `summer`, `winter`, `all` |
| `style` | enum | `formal`, `casual`, `party`, `eid` |
| `color` | string | matched against `colors` array (lowercased) |
| `minPrice` / `maxPrice` | number | >= 0 |
| `trending` | boolean | filters `isTrending` |
| `page` | int | >= 1, default 1 |
| `limit` | int | 1–100, default 20 |
| `sort` | enum | `newest` (default), `oldest`, `price-asc`, `price-desc`, `best-selling`, `rating` |

```bash
curl "http://localhost:5000/api/products?category=dresses&color=black&maxPrice=5000&sort=price-asc"
```

```json
{
  "items": [
    {
      "_id": "6650...",
      "name": "Black Chiffon Maxi",
      "slug": "black-chiffon-maxi",
      "category": "dresses",
      "gender": "women",
      "season": "all",
      "style": "party",
      "price": 4500,
      "discount": 10,
      "description": "...",
      "sizes": ["S", "M", "L"],
      "colors": ["black"],
      "stock": [{ "size": "M", "color": "black", "qty": 8 }],
      "images": ["https://res.cloudinary.com/..."],
      "rating": 4.6,
      "soldCount": 34,
      "isTrending": true,
      "isActive": true
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 7,
  "totalPages": 1
}
```

### GET /products/:slug

Auth: none. Params: `slug` (non-empty string). Returns a single product document (shape as above) or `404 { "error": "Product not found" }`.

```bash
curl http://localhost:5000/api/products/black-chiffon-maxi
```

---

## 5. Chat (web channel)

### POST /chat

Auth: none. Rate-limited (see Overview).

Body:

| Field | Type | Constraints |
|---|---|---|
| `sessionId` | string | UUID (client-generated, identifies the web customer) |
| `message` | string | 1–1000 chars |

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"3b2a1c9e-0f4d-4c7a-9e2b-1a2b3c4d5e6f","message":"black dresses under 5000"}'
```

```json
{
  "reply": "We have some lovely black dresses under Rs 5,000! ...",
  "products": [
    {
      "id": "6650...",
      "name": "Black Chiffon Maxi",
      "slug": "black-chiffon-maxi",
      "price": 4500,
      "discount": 10,
      "image": "https://res.cloudinary.com/...",
      "sizes": ["S", "M", "L"],
      "colors": ["black"],
      "rating": 4.6
    }
  ],
  "quickReplies": [],
  "intent": "product_search",
  "sentiment": "interested",
  "order": null
}
```

### GET /chat/:sessionId/history

Auth: none. Params: `sessionId` (UUID). Returns the web conversation for that session (admin takeover messages excluded).

```bash
curl http://localhost:5000/api/chat/3b2a1c9e-0f4d-4c7a-9e2b-1a2b3c4d5e6f/history
```

```json
{
  "messages": [
    { "role": "customer", "text": "black dresses under 5000", "createdAt": "2026-07-23T09:00:00.000Z" },
    { "role": "assistant", "text": "We have some lovely...", "products": ["..."], "createdAt": "2026-07-23T09:00:03.000Z" }
  ]
}
```

### Chat response contract

Every `POST /chat` response (and the payload the Meta dispatcher consumes) follows:

| Field | Type | Notes |
|---|---|---|
| `reply` | string | Composed assistant reply. Falls back to a canned safe reply if all LLM providers fail. |
| `products` | array | Up to 4 product cards: `{ id, name, slug, price, discount, image, sizes, colors, rating }` |
| `quickReplies` | string[] | Menu options when relevant: `New Arrivals`, `Women's Collection`, `Men's Collection`, `Order Tracking`, `Delivery Information` |
| `intent` | enum | `greeting`, `product_search`, `size_query`, `color_query`, `price_query`, `delivery_query`, `order_place`, `order_track`, `return_exchange`, `complaint`, `discount_query`, `menu_selection`, `other` |
| `sentiment` | enum | `happy`, `angry`, `frustrated`, `interested`, `neutral` |
| `order` | object \| null | When an order was placed or tracked: `{ orderId, total, status }` (orderId format `FH-YYYY-NNNN`) |

---

## 6. Meta Webhooks

### GET /webhooks/meta — verification handshake

Auth: none (Meta calls it once during setup).

Query params (sent by Meta): `hub.mode=subscribe`, `hub.verify_token`, `hub.challenge`.

If `hub.mode` is `subscribe` and `hub.verify_token` matches `META_VERIFY_TOKEN`, responds `200` with the raw `hub.challenge` string; otherwise `403`.

```bash
curl "http://localhost:5000/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=<token>&hub.challenge=12345"
# → 12345
```

### POST /webhooks/meta — inbound events

Auth: HMAC signature. The `X-Hub-Signature-256` header must equal `sha256=` + HMAC-SHA256 of the raw request body keyed with `META_APP_SECRET`; invalid or missing signatures get `401` and the body is discarded.

Behavior:

- ACKs immediately with `200 EVENT_RECEIVED`; all processing happens async (`setImmediate`), so Meta never times out.
- Routes on `body.object`: `whatsapp_business_account` → WhatsApp adapter, `instagram` → Instagram adapter; anything else is ignored.
- Message types handled: WhatsApp `text`, `audio` (voice notes, downloaded + transcribed), `interactive` (list/button replies), `button`; Instagram `text` and `audio` attachments (echoes and self-sent messages are skipped). Other types are treated as unsupported.
- Dedupe: an in-memory LRU of the last 500 Meta message IDs skips redelivered events.
- Replies are sent back through the Graph API (WhatsApp Cloud API / Instagram Messaging) by the channel adapters, using the same AI pipeline and chat response contract as `/chat`.

---

## 7. Admin API

All routes below require `Authorization: Bearer <token>`.

### 7.1 Stats

#### GET /admin/stats

Dashboard aggregates.

```bash
curl http://localhost:5000/api/admin/stats -H "Authorization: Bearer $TOKEN"
```

```json
{
  "revenue": 152300,
  "ordersCount": 42,
  "customersCount": 31,
  "conversationsCount": 55,
  "openConversations": 6,
  "ordersByStatus": { "pending": 4, "shipped": 10, "delivered": 25 },
  "salesByDay": [{ "date": "2026-07-10", "total": 9000, "count": 2 }, "..."],
  "topProducts": [{ "id": "6650...", "name": "Black Chiffon Maxi", "image": "https://...", "soldCount": 34, "price": 4500 }],
  "recentOrders": [{ "id": "6650...", "orderId": "FH-2026-0042", "customerName": "Ayesha", "total": 4800, "status": "pending", "createdAt": "2026-07-23T08:30:00.000Z" }],
  "lowStock": [{ "id": "6650...", "name": "Beige Khussa", "totalQty": 3 }]
}
```

`salesByDay` always contains 14 entries (last 14 days, zero-filled).

### 7.2 Products

#### GET /admin/products

Includes inactive products. Query: `search`, `category`, `gender`, `page`, `limit`, `sort` (same constraints as public list; no season/style/color/price filters). Response shape identical to `GET /products`.

#### POST /admin/products

Body (all product fields; `*` required):

| Field | Type | Constraints |
|---|---|---|
| `name`* | string | min 2 chars |
| `slug` | string | kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`); auto-generated from `name` if omitted |
| `category`* | enum | `dresses`, `shirts`, `shoes`, `handbags`, `accessories` |
| `gender`* | enum | `men`, `women`, `unisex` |
| `season` | enum | `summer`, `winter`, `all` (default `all`) |
| `style` | enum | `formal`, `casual`, `party`, `eid` (default `casual`) |
| `price`* | number | >= 0 |
| `discount` | number | 0–100, default 0 |
| `description` | string | default `""` |
| `sizes` / `colors` | string[] | default `[]` |
| `stock` | array | `{ size: string, color: string, qty: int >= 0 }[]` |
| `images` | string[] | valid URLs |
| `rating` | number | 0–5, default 0 |
| `soldCount` | int | >= 0, default 0 |
| `isTrending` / `isActive` | boolean | defaults `false` / `true` |

```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Red Silk Kurti","category":"dresses","gender":"women","price":3200,"sizes":["S","M"],"colors":["red"],"stock":[{"size":"M","color":"red","qty":10}]}'
```

Returns `201` with the created product document.

#### GET /admin/products/:id

Params: `id` (24-hex ObjectId). Returns the product document or `404`.

#### PUT /admin/products/:id

Params: `id`. Body: any subset of the create fields (partial update). Returns the updated document.

#### DELETE /admin/products/:id

Returns `{ "deleted": true }` or `404 { "error": "Product not found" }`.

### 7.3 Orders

#### GET /admin/orders

Query:

| Param | Type | Values |
|---|---|---|
| `status` | enum | `pending`, `confirmed`, `packed`, `shipped`, `delivered`, `cancelled`, `returned` |
| `paymentStatus` | enum | `unpaid`, `cod`, `paid`, `refunded` |
| `channel` | enum | `whatsapp`, `instagram`, `web` |
| `search` | string | 1–100 chars; matches orderId or customer name (case-insensitive) |
| `page` / `limit` | int | 1+ / 1–100 (default 1 / 20) |

```bash
curl "http://localhost:5000/api/admin/orders?status=pending&page=1" -H "Authorization: Bearer $TOKEN"
```

```json
{
  "items": [
    {
      "id": "6650...",
      "orderId": "FH-2026-0042",
      "customer": { "id": "6650...", "name": "Ayesha", "phone": "+9230..." },
      "itemsCount": 1,
      "total": 4800,
      "status": "pending",
      "paymentStatus": "cod",
      "channel": "web",
      "trackingNumber": null,
      "createdAt": "2026-07-23T08:30:00.000Z"
    }
  ],
  "page": 1,
  "total": 4,
  "totalPages": 1
}
```

#### GET /admin/orders/:id

Full order document with populated customer and enriched items:

```json
{
  "id": "6650...",
  "orderId": "FH-2026-0042",
  "customer": { "_id": "6650...", "name": "Ayesha", "phone": "+9230...", "language": "en" },
  "items": [{ "product": "6650...", "name": "Black Chiffon Maxi", "image": "https://...", "slug": "black-chiffon-maxi", "size": "M", "color": "black", "qty": 1, "unitPrice": 4050 }],
  "subtotal": 4050,
  "deliveryCharges": 250,
  "total": 4300,
  "status": "pending",
  "paymentStatus": "cod",
  "channel": "web",
  "address": { "street": "...", "city": "Lahore" },
  "createdAt": "2026-07-23T08:30:00.000Z"
}
```

#### PATCH /admin/orders/:id

Body (at least one field required):

| Field | Type | Values |
|---|---|---|
| `status` | enum | order statuses above |
| `paymentStatus` | enum | payment statuses above |
| `trackingNumber` | string | max 60 chars |

Setting `status` to `shipped` without a tracking number auto-generates one (`TRK-XXXXXXXX`). Returns the full order (same shape as GET one).

```bash
curl -X PATCH http://localhost:5000/api/admin/orders/6650... \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"shipped"}'
```

### 7.4 Customers

#### GET /admin/customers

Query: `search` (1–100 chars; matches name, phone, or instagramId), `page`, `limit`.

```bash
curl "http://localhost:5000/api/admin/customers?search=ayesha" -H "Authorization: Bearer $TOKEN"
```

```json
{
  "items": [
    {
      "id": "6650...",
      "name": "Ayesha",
      "phone": "+9230...",
      "instagramId": null,
      "channelHint": "whatsapp",
      "city": "Lahore",
      "ordersCount": 2,
      "preferences": { "favoriteColors": ["black"], "sizes": ["M"], "categories": ["dresses"], "budgetMax": 5000 },
      "language": "en",
      "createdAt": "2026-07-20T10:00:00.000Z"
    }
  ],
  "page": 1,
  "total": 1,
  "totalPages": 1
}
```

#### GET /admin/customers/:id

Full customer document plus `channelHint` and an `orders` array of `{ id, orderId, total, status, createdAt }`.

### 7.5 Conversations

#### GET /admin/conversations

Query: `channel` (`whatsapp` | `instagram` | `web`), `isOpen` (`"true"` | `"false"`), `page`, `limit`. Sorted by `lastMessageAt` desc.

```bash
curl "http://localhost:5000/api/admin/conversations?channel=web&isOpen=true" -H "Authorization: Bearer $TOKEN"
```

```json
{
  "items": [
    {
      "id": "6650...",
      "customer": { "id": "6650...", "name": "Ayesha" },
      "channel": "web",
      "lastMessageAt": "2026-07-23T09:00:03.000Z",
      "isOpen": true,
      "lastMessage": { "role": "assistant", "text": "We have some lovely..." },
      "messagesCount": 8,
      "lastIntent": "product_search",
      "lastSentiment": "interested"
    }
  ],
  "page": 1,
  "total": 6,
  "totalPages": 1
}
```

#### GET /admin/conversations/:id

Full transcript: `{ id, customer, channel, isOpen, lastMessageAt, createdAt, messages: [{ role, text, mediaUrl, intent, sentiment, products, createdAt }] }` where `role` is `customer` | `assistant` | `admin`.

#### PATCH /admin/conversations/:id

Body: `{ "isOpen": boolean }` (required). Returns `{ "id": "...", "isOpen": false }`.

### 7.6 Settings

#### GET /admin/settings

Returns all four keys (each `null` if unseeded):

```json
{
  "policies": { "returnPolicy": "...", "exchangePolicy": "...", "refundProcess": "..." },
  "delivery": { "defaultCharges": 250, "freeAbove": 5000, "cities": [{ "name": "Lahore", "days": 2, "charges": 200, "sameDay": true }], "note": "..." },
  "persona": { "brandVoice": "...", "extraInstructions": "", "greeting": "..." },
  "faq": [{ "q": "Do you offer COD?", "a": "Yes..." }]
}
```

#### PUT /admin/settings/:key

Params: `key` in `policies` | `delivery` | `persona` | `faq`. Body: `{ "value": <object or array> }`. The value is validated against a per-key schema (fields shown in the GET example; `policies.*` and `persona.brandVoice` are required non-empty strings, `delivery` numbers >= 0, `faq` items need non-empty `q` and `a`). Invalid values return `400` with field details in the message. Returns `{ "key": "...", "value": { ... } }`.

```bash
curl -X PUT http://localhost:5000/api/admin/settings/persona \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"value":{"brandVoice":"Warm, helpful, concise","extraInstructions":"","greeting":"Assalam o Alaikum!"}}'
```

### 7.7 Uploads

#### POST /admin/uploads

Multipart form with a single file field named `image`. Accepted types: `image/jpeg`, `image/png`, `image/webp`. Max 5 MB. Stored on Cloudinary under `fashionhub/products` with `f_auto,q_auto` delivery.

```bash
curl -X POST http://localhost:5000/api/admin/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@./maxi.jpg"
```

Returns `201`:

```json
{ "url": "https://res.cloudinary.com/.../upload/f_auto,q_auto/fashionhub/products/abc123.jpg", "publicId": "fashionhub/products/abc123" }
```

Missing file → `400 { "error": "No image file provided (field name: image)" }`.

### 7.8 Export

#### GET /admin/export/:type

Params: `type` in `orders` | `customers` | `products`. Responds with `text/csv` and a `Content-Disposition: attachment; filename="fashionhub-<type>-<YYYY-MM-DD>.csv"` header.

```bash
curl -OJ http://localhost:5000/api/admin/export/orders -H "Authorization: Bearer $TOKEN"
```

---

## 8. Environment variables (`server/.env.example`)

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port the Express server listens on (default 5000) |
| `MONGODB_URI` | MongoDB / Atlas connection string |
| `JWT_SECRET` | Signing secret for admin JWTs |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated |
| `GEMINI_API_KEY` | Google Gemini API key (primary LLM provider) |
| `GEMINI_MODEL` | Gemini model id (default `gemini-2.5-flash`) |
| `GROQ_API_KEY` | Groq API key (fallback LLM provider) |
| `GROQ_MODEL` | Groq model id (default `llama-3.3-70b-versatile`) |
| `CHAT_RATE_LIMIT_PER_MIN` | Per-IP request cap for `POST /api/chat` (default 20) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name for image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `META_GRAPH_VERSION` | Meta Graph API version (default `v25.0`) |
| `META_VERIFY_TOKEN` | Token echoed back during the webhook GET verification handshake |
| `META_APP_SECRET` | HMAC key for validating `X-Hub-Signature-256` on webhook POSTs |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Cloud API phone number id (send endpoint) |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Cloud API access token |
| `INSTAGRAM_ACCOUNT_ID` | Instagram business account id (used to skip self-sent messages) |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram Messaging API access token |
| `N8N_WEBHOOK_BASE_URL` | Base URL for n8n webhook notifications (order-created, complaint-received) |
