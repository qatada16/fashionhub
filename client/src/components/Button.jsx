import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const button = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-ink hover:bg-accent/90',
        ghost: 'bg-transparent text-ink border border-line hover:bg-surface-2',
        danger: 'bg-danger text-accent-ink hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export default function Button({
  variant,
  size,
  loading = false,
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={clsx(button({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      <span className={clsx('inline-flex items-center gap-2', loading && 'invisible')}>
        {children}
      </span>
      {loading && (
        <span className="absolute inline-flex" aria-hidden="true">
          <Loader2 className="size-4 animate-spin" />
        </span>
      )}
    </button>
  );
}
