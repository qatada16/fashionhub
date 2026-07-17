# FashionHub — AI Fashion Sales Assistant

**Source:** CodeCelix AI Internship Project brief (`fashionhub.pdf`)
**Deadline:** 1 week (target: live in 2–3 days)
**Budget:** $0 — free tiers only (optional paid Google key as fallback)

## Objective

An AI-powered sales assistant for a clothing brand ("FashionHub") that automatically
replies to customer messages on **Instagram DMs** and **WhatsApp**, understands queries,
recommends products, and collects orders — behaving like a professional sales rep.

## Target Audience

- **End customers:** Pakistani fashion shoppers messaging the brand on Instagram/WhatsApp
  (Urdu + English, prices in Rs, cities like Lahore/Islamabad).
- **Brand admins:** Staff managing products, orders, customers, and conversations
  through a web dashboard.
- **Evaluators:** CodeCelix reviewers assessing the internship deliverables.

## Goals

1. Instant, accurate, helpful AI replies on Instagram + WhatsApp (and a web chat demo).
2. Intent detection (greeting, product search, order, delivery, complaint, return, discount)
   and sentiment-aware responses (happy, angry, frustrated, interested).
3. AI product recommendation engine (gender, budget, color, category, history, trending).
4. Full order pipeline: recommend → collect details + address → confirm → track.
5. Admin dashboard: products CRUD, customers, orders, conversations, export, AI training.
6. n8n automation layer for messaging workflows.
7. Bonus: voice message support, Urdu + English, AI sales replies, auto-upselling.

## Required Query Coverage (must all work)

- **Product:** show black dresses, summer/winter collection, formal/casual, men's shirts,
  handbags, shoes under Rs 3000, trending, best sellers
- **Size:** medium/XL availability, size advice, size chart
- **Color:** available colors, black/red/beige queries
- **Price:** price, discounts, sale, cheapest, under Rs 2000/5000
- **Delivery:** charges, same-day, city-specific (Islamabad/Lahore), duration
- **Exchange/Return:** policy, exchange, refund, damaged item
- **Tracking:** track order, parcel location, status, tracking ID
- Menu-driven greeting flow (New Arrivals / Women's / Men's / Order Tracking / Delivery Info)

## Deliverables

Complete source code · AI workflow (n8n) · database design · admin dashboard ·
Instagram DM integration · WhatsApp integration · API documentation · deployment guide.

## Success Criteria

- Every listed query type returns a relevant, accurate answer grounded in real DB data.
- End-to-end order placed entirely via chat and visible in the admin dashboard.
- Fully deployed and reachable via public URLs at $0 cost.
- Dashboard is polished, responsive, dark/light, and does not look AI-generated.
