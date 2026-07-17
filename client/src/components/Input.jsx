import clsx from 'clsx';
import { useId } from 'react';

export default function Input({ label, className, ...props }) {
  const id = useId();
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-wide text-ink-soft"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className="h-10 rounded-lg bg-surface-2 px-3 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent"
        {...props}
      />
    </div>
  );
}
