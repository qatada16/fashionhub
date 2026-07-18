import clsx from 'clsx';
import { useId } from 'react';

export default function Textarea({ label, hint, className, rows = 4, ...props }) {
  const id = useId();
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className="rounded-lg bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent"
        {...props}
      />
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
