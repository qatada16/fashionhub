---
name: design-system
description: FashionHub UI design system — visual identity, Tailwind tokens, dark/light theming, motion rules, and component recipes. Load before writing or reviewing ANY client/ UI code so every screen stays consistent and avoids the generic AI-made look.
---

# FashionHub Design System

Identity: **editorial fashion** — think a premium lookbook, not a SaaS template.
Confident type, warm neutrals, one bold accent, generous whitespace, restrained motion.

## Tokens (defined once in `client/src/index.css` via Tailwind v4 `@theme`)

Colors are CSS variables that flip with the `.dark` class on `<html>`:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-canvas` | #FAF7F2 (warm ivory) | #0E0D0B (near-black warm) | page background |
| `--color-surface` | #FFFFFF | #1A1815 | cards, panels |
| `--color-surface-2` | #F1EDE6 | #24211D | hover, wells, inputs |
| `--color-ink` | #1C1A17 | #F4F1EA | primary text |
| `--color-ink-soft` | #6B655C | #A8A296 | secondary text |
| `--color-line` | #E4DFD5 | #322E28 | borders, dividers |
| `--color-accent` | #B4552D (terracotta) | #D97848 | CTAs, active states, links |
| `--color-accent-ink` | #FFF8F3 | #1A0E07 | text on accent |
| `--color-success` | #3F7D58 | #6FBF8F | confirmed, delivered |
| `--color-warn` | #B08A2E | #D9B45B | pending, low stock |
| `--color-danger` | #A63D3D | #E07A7A | errors, cancelled |

Never use raw Tailwind palette colors (`bg-blue-500` etc.) — tokens only.

## Typography

- Display/headings: **"Fraunces"** (Google Fonts, self-host via `@fontsource`) — serif,
  gives the editorial character. Weights 500/600.
- Body/UI: **"Inter"** (self-host) 400/500/600. Numbers in orders/prices: `tabular-nums`.
- Scale: h1 `text-3xl/tight`, h2 `text-xl`, body `text-sm` (dashboards) / `text-base`
  (chat, landing). Letter-spacing slightly tight on headings (`tracking-tight`).

## Layout & Shape

- Radius: `rounded-xl` cards, `rounded-lg` inputs/buttons, `rounded-full` pills/avatars.
- Borders over shadows: 1px `--color-line` borders; shadows only for popovers/modals
  (`shadow-lg/10`). Flat, print-like surfaces.
- Dashboard shell: fixed sidebar (collapsible to icons <1024px, bottom bar <640px),
  topbar with search + theme toggle + admin menu. Content max-w-screen-2xl, `p-6`.
- Spacing rhythm: multiples of 4; section gaps `gap-6`.

## Motion (framer-motion; must feel intentional, never decorative noise)

- Page/route transitions: fade + 8px rise, 180ms ease-out.
- List items (products, orders, messages): stagger 30ms, once on mount only.
- Chat messages: slide-in from sender side + fade, 160ms; typing indicator = three
  bouncing dots using accent color.
- Hover: scale 1.01 max on cards; buttons darken via token, no scale.
- Respect `prefers-reduced-motion` — wrap variants with a `useReducedMotion` guard.

## Theming

- `.dark` class strategy on `<html>`; zustand store persisted to localStorage; default
  follows `prefers-color-scheme`. Toggle = sun/moon icon-morph in topbar.
- Every component must be checked in both themes before done.

## Component recipes

- **Button**: variants `primary` (accent bg), `ghost` (transparent, ink text, line border),
  `danger`; sizes sm/md; loading spinner replaces label, width preserved. Build with cva.
- **Card**: surface bg, line border, `rounded-xl p-5`; header row = serif title + action.
- **StatCard** (dashboard): big serif number, small soft label, tiny trend arrow.
- **Table**: sticky header, row hover `surface-2`, status as tinted pills
  (success/warn/danger at 12% opacity bg + solid text).
- **Chat bubble**: customer = surface-2 left-aligned; assistant = accent-tinted (accent
  at 10% bg, accent border) right; product cards inside chat = mini Card with image,
  name (serif), price, and "Add to order" ghost button.
- **Inputs**: surface-2 bg, no border until focus (`ring-accent`), floating-free labels
  above (`text-xs ink-soft uppercase tracking-wide`).
- **Empty states**: small illustration-free — serif line + one CTA, centered, `py-16`.
- **Skeletons**: `animate-pulse` blocks in `surface-2`, match final layout exactly.

## Forbidden (the "AI-made" tells)

- Purple/indigo gradients, glassmorphism, emoji in headings, `shadow-2xl` everywhere,
  centered-everything landing pages, default Tailwind blue, gray-on-white only palette.
- Inline `style=` attributes. Arbitrary one-off hex values outside tokens.
- More than one accent color per view.
