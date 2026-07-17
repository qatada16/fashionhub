# FashionHub — Project Rules

AI Fashion Sales Assistant (Instagram + WhatsApp + web chat + admin dashboard).
Read `docs/PROJECT-BRIEF.md` and `docs/ARCHITECTURE.md` before any work.
After every work session, append to `docs/PROGRESS.md`.

## Structure

- `client/` — React 18 + Vite + Tailwind v4 (admin dashboard, landing, web chat)
- `server/` — Node 20 + Express + Mongoose (REST, Meta webhooks, AI engine)
- `n8n/` — exported workflow JSONs
- `docs/` — brief, architecture, schema, deployment, progress, API docs

## Hard Rules

- **No excessive comments.** Comment only non-obvious constraints. Never narrate code.
- **No inline styles.** Tailwind classes only; shared variants via small helpers/cva.
- **No secrets in git.** Real `.env` git-ignored; keep `.env.example` templates updated
  whenever a new env var is introduced.
- **Product facts come from MongoDB via tools, never from LLM memory.**
- **Free tier discipline:** single LLM call per message where possible; Gemini → Groq
  fallback; webhooks ACK 200 immediately, process async.
- ES modules everywhere (`"type": "module"`). Async/await, no callback style.
- Errors: central Express error middleware; no silent catches.

## Frontend conventions

- Follow `.claude/skills/design-system/SKILL.md` for all UI work (tokens, dark/light,
  motion, components). No generic "AI-made" look.
- Components in `client/src/components/` (shared) and `client/src/features/<area>/`.
- Data fetching via TanStack Query hooks in `client/src/api/`; client state via zustand.
- Every page responsive (mobile-first) and works in both themes.

## Backend conventions

- Layered: `routes/ → controllers/ → services/ → models/`. AI engine in `server/src/ai/`.
- Validation with zod at the route boundary. JWT auth middleware for `/api/admin/*`.
- Meta webhook: verify `X-Hub-Signature-256` with `META_APP_SECRET`.

## Delegation

Use the subagents in `.claude/agents/` for heavy implementation to keep this context
lean: `frontend`, `backend`, `ai-workflow`, `integrations`. Give each a tight task spec
and the doc paths it needs; verify their output compiles/runs before accepting.

## Verification

- Server: `npm run dev` boots without errors; test endpoints with curl.
- Client: `npm run dev` + `npm run build` both pass; check both themes.
- Never claim something works without running it.
