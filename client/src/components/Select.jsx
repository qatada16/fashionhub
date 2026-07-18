import clsx from 'clsx';
import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({ label, options = [], className, ...props }) {
  const id = useId();
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className="h-10 w-full appearance-none rounded-lg bg-surface-2 px-3 pr-9 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          {...props}
        >
          {options.map((opt) => {
            const o = typeof opt === 'string' ? { value: opt, label: opt } : opt;
            return (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            );
          })}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
