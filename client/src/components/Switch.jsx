import clsx from 'clsx';

export default function Switch({ label, checked, onChange, className, ...props }) {
  return (
    <label className={clsx('inline-flex cursor-pointer items-center gap-2.5', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative h-5.5 w-10 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          checked ? 'bg-accent' : 'bg-surface-2 border border-line'
        )}
        {...props}
      >
        <span
          className={clsx(
            'absolute top-0.5 size-4.5 rounded-full bg-surface transition-transform',
            checked ? 'left-0.5 translate-x-4' : 'left-0.5 translate-x-0'
          )}
        />
      </button>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
