import clsx from 'clsx';

export default function Card({ title, action, className, children }) {
  return (
    <div className={clsx('rounded-xl border border-line bg-surface p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="font-display text-lg font-medium tracking-tight">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
