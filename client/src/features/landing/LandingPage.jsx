import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sun,
  Moon,
  Clock,
  Languages,
  Sparkles,
  PackageCheck,
  MessageCircle,
  Instagram,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { useThemeStore, useResolvedTheme } from '../../stores/theme.js';

const FEATURES = [
  {
    icon: Clock,
    title: 'Instant replies, 24/7',
    text: 'Every DM answered in seconds — while you sleep, the assistant sells.',
  },
  {
    icon: Languages,
    title: 'Urdu, English & voice notes',
    text: 'Replies in the customer’s own language, and understands voice messages too.',
  },
  {
    icon: Sparkles,
    title: 'Grounded recommendations',
    text: 'Suggestions come straight from your live catalog — real stock, real prices.',
  },
  {
    icon: PackageCheck,
    title: 'Orders collected in chat',
    text: 'Name, phone, address gathered conversationally. Cash on delivery, done.',
  },
];

const CHANNELS = [
  { icon: MessageCircle, label: 'WhatsApp' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Globe, label: 'Web chat' },
];

const PREVIEW = [
  { role: 'customer', text: 'Kuch acha sa black dress dikhayen, Eid k liye 🌙' },
  {
    role: 'assistant',
    text: 'Great choice! Here’s a favourite for Eid:',
    product: { name: 'Black Embroidered Maxi', price: 'Rs 5,850', was: 'Rs 6,500' },
  },
  { role: 'customer', text: 'Perfect — order kar dein, size M' },
  { role: 'assistant', text: 'Done! Just share your name and address and I’ll place it — cash on delivery.' },
];

function Rise({ children, delay = 0, className }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.18, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function LandingNav() {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = useResolvedTheme();
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="rounded-lg font-display text-xl font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          FashionHub
        </Link>
        <nav className="flex items-center gap-1" aria-label="Landing">
          <Link
            to="/chat"
            className="rounded-lg px-2.5 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Try the assistant
          </Link>
          <Link
            to="/login"
            data-testid="nav-admin"
            className="rounded-lg px-2.5 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Admin
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

function ChatPreview() {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5" aria-hidden="true">
      <div className="mb-4 flex items-center gap-2 border-b border-line pb-3">
        <span className="size-2 rounded-full bg-success" />
        <span className="text-xs uppercase tracking-wide text-ink-soft">FashionHub Assistant · online</span>
      </div>
      <div className="space-y-3">
        {PREVIEW.map((m, i) =>
          m.role === 'customer' ? (
            <div key={i} className="flex justify-start">
              <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-surface-2 px-3.5 py-2 text-sm">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%]">
                <div className="rounded-xl rounded-br-sm border border-accent/30 bg-accent/10 px-3.5 py-2 text-sm">
                  {m.text}
                </div>
                {m.product && (
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-display text-sm text-ink-soft">
                      B
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-medium">{m.product.name}</p>
                      <p className="text-xs tabular-nums text-ink-soft">
                        <span className="line-through">{m.product.was}</span>{' '}
                        <span className="font-medium text-accent">{m.product.price}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <LandingNav />
      <main>
        <section
          data-testid="landing-hero"
          className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_1fr]"
        >
          <Rise>
            <p className="text-xs uppercase tracking-wide text-accent">AI Sales Assistant</p>
            <h1 className="mt-4 font-display text-4xl/tight font-semibold tracking-tight sm:text-5xl/tight">
              Your fashion store, answering every DM.
            </h1>
            <p className="mt-5 max-w-md text-base text-ink-soft">
              An AI assistant for Instagram, WhatsApp and web chat — it recommends outfits,
              answers in Urdu or English, and collects orders right in the conversation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/chat"
                data-testid="landing-cta-chat"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Chat with FashionHub
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Admin dashboard
              </Link>
            </div>
          </Rise>
          <Rise delay={0.08}>
            <ChatPreview />
          </Rise>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <Rise>
              <h2 className="font-display text-xl font-medium tracking-tight">
                Everything a shop assistant does — without the wait
              </h2>
            </Rise>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, text }, i) => (
                <Rise key={title} delay={i * 0.05}>
                  <div className="h-full rounded-xl border border-line bg-surface p-5">
                    <Icon className="size-5 text-accent" aria-hidden="true" />
                    <h3 className="mt-3 font-display text-base font-medium">{title}</h3>
                    <p className="mt-2 text-sm text-ink-soft">{text}</p>
                  </div>
                </Rise>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <Rise>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  One assistant, every channel
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  {CHANNELS.map(({ icon: Icon, label }) => (
                    <span key={label} className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="size-4 text-accent" aria-hidden="true" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </Rise>
          </div>
        </section>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-ink-soft sm:flex-row sm:px-6">
          <span className="font-display text-sm font-medium text-ink">FashionHub</span>
          <span>CodeCelix internship project · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
