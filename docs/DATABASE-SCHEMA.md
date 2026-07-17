# Database Schema (MongoDB Atlas — Mongoose)

Database name: `fashionhub`

## products

```js
{
  name: String,            // "Black Embroidered Maxi"
  slug: String,            // unique, url-safe
  category: String,        // enum: dresses | shirts | shoes | handbags | accessories | ...
  gender: String,          // men | women | unisex
  season: String,          // summer | winter | all
  style: String,           // formal | casual | party | eid
  price: Number,           // Rs
  discount: Number,        // percent, 0 default
  description: String,
  sizes: [String],         // ["S","M","L","XL"]
  colors: [String],        // lowercase names
  stock: [{ size, color, qty }],
  images: [String],        // Cloudinary URLs
  rating: Number,          // 0–5
  soldCount: Number,       // drives trending/best-sellers
  isTrending: Boolean,
  isActive: Boolean,
  timestamps: true
}
// text index on name+description; indexes on category, gender, price
```

## customers

```js
{
  name: String,
  phone: String,           // WhatsApp id, sparse unique
  instagramId: String,     // IGSID, sparse unique
  webSessionId: String,    // web chat visitors, sparse unique
  address: { street, city, province, postalCode },
  preferences: { favoriteColors: [String], sizes: [String], budgetMax: Number, categories: [String] },
  orderHistory: [ObjectId->orders],
  language: String,        // en | ur | roman-ur (auto-detected)
  timestamps: true
}
```

## orders

```js
{
  orderId: String,         // human-friendly "FH-2026-0001", unique
  customer: ObjectId->customers,
  items: [{ product: ObjectId->products, name, size, color, qty, unitPrice }],
  subtotal: Number,
  deliveryCharges: Number,
  total: Number,
  status: String,          // pending | confirmed | packed | shipped | delivered | cancelled | returned
  paymentStatus: String,   // unpaid | cod | paid | refunded
  paymentMethod: String,   // cod (default)
  trackingNumber: String,
  channel: String,         // whatsapp | instagram | web
  deliveryAddress: { street, city, province, postalCode },
  timestamps: true
}
```

## conversations

```js
{
  customer: ObjectId->customers,
  channel: String,         // whatsapp | instagram | web
  messages: [{
    role: String,          // customer | assistant | admin
    text: String,
    mediaUrl: String,      // voice notes / images
    intent: String,        // detected intent
    sentiment: String,     // happy | angry | frustrated | interested | neutral
    createdAt: Date
  }],
  isOpen: Boolean,
  lastMessageAt: Date,     // indexed, drives dashboard inbox
  timestamps: true
}
```

## settings (singleton-ish, admin-editable "Train AI")

```js
{
  key: String,             // unique: "policies" | "delivery" | "persona" | "faq"
  value: Mixed
}
// policies: return/exchange/refund text
// delivery: { defaultCharges, freeAbove, cities: [{name, days, charges, sameDay}] }
// persona: system-prompt additions (brand voice) — the "Train AI Responses" feature
// faq: [{ q, a }] custom trained answers
```

## admins

```js
{ name, email (unique), passwordHash, role: "admin", timestamps: true }
```

## Seed data

`server/src/seed/` ships ~40 realistic products (dresses, shirts, shoes, handbags across
price ranges Rs 1,500–8,000, mens/womens, summer/winter, with Cloudinary demo images)
so every brief query ("shoes under Rs 3000", "beige color available?") has real answers.
