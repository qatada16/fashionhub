import { cva } from 'class-variance-authority';
import clsx from 'clsx';

const badge = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        success: 'bg-success/12 text-success',
        warn: 'bg-warn/12 text-warn',
        danger: 'bg-danger/12 text-danger',
        accent: 'bg-accent/12 text-accent',
        neutral: 'bg-surface-2 text-ink-soft',
      },
    },
    defaultVariants: { tone: 'neutral' },
  }
);

export default function Badge({ tone, className, children }) {
  return <span className={clsx(badge({ tone }), className)}>{children}</span>;
}
