import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, trend, className }) {
  const up = typeof trend === 'number' && trend >= 0;
  return (
    <div className={clsx('rounded-xl border border-line bg-surface p-5', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-3xl/tight font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {typeof trend === 'number' && (
        <p
          className={clsx(
            'mt-1 inline-flex items-center gap-1 text-xs font-medium tabular-nums',
            up ? 'text-success' : 'text-danger'
          )}
        >
          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(trend)}%
        </p>
      )}
    </div>
  );
}
