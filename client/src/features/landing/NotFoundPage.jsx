import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-16 text-center">
      <p className="text-xs uppercase tracking-wide text-accent">404</p>
      <h1 className="mt-4 font-display text-4xl/tight font-semibold tracking-tight">
        Lost in the racks?
      </h1>
      <p className="mt-3 max-w-sm text-base text-ink-soft">
        The page you’re looking for isn’t on this shelf.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Home
        </Link>
        <Link
          to="/chat"
          className="inline-flex h-10 items-center rounded-lg border border-line px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Chat
        </Link>
      </div>
    </div>
  );
}
