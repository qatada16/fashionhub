import clsx from 'clsx';

export function Table({ className, children }) {
  return (
    <div className={clsx('overflow-x-auto rounded-xl border border-line bg-surface', className)}>
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ columns }) {
  return (
    <thead className="sticky top-0 bg-surface-2">
      <tr>
        {columns.map((col, i) => (
          <th
            key={`${col}-${i}`}
            className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-ink-soft"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-line">{children}</tbody>;
}

export function TRow({ className, children, ...props }) {
  return (
    <tr className={clsx('transition-colors hover:bg-surface-2', className)} {...props}>
      {children}
    </tr>
  );
}

export function TCell({ className, children }) {
  return <td className={clsx('px-4 py-3 tabular-nums', className)}>{children}</td>;
}
