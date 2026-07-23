# FashionHub — AI Fashion Sales Assistant

**Live:** [fashion-hub16.vercel.app](https://fashion-hub16.vercel.app) · [API](https://fashionhub-api-xq5h.onrender.com/api/health) · [Demo guide](docs/DEMO-GUIDE.md)

AI sales assistant for clothing brands: auto-replies to Instagram DMs and WhatsApp,
understands queries (English + Urdu, text + voice), recommends products from a live
catalog, collects orders, and gives admins a full dashboard. CodeCelix internship project.

## Docs

- [Project brief & goals](docs/PROJECT-BRIEF.md)
- [Architecture & tech stack](docs/ARCHITECTURE.md)
- [Database schema](docs/DATABASE-SCHEMA.md)
- [API documentation](docs/API.md)
- [Deployment & API keys guide](docs/DEPLOYMENT.md)
- [n8n workflows](n8n/README.md)
- [Progress log](docs/PROGRESS.md)

## Stack

React + Vite + Tailwind · Node + Express · MongoDB Atlas · LangChain.js with
Gemini Flash (Groq fallback) · n8n · Meta WhatsApp Cloud API + Instagram Messaging API.
Deployed free: Vercel (client) + Render (server, n8n) + Atlas M0 + Supabase (n8n DB).

## Status

Phase 0 (preparation) complete — see [PROGRESS.md](docs/PROGRESS.md).
