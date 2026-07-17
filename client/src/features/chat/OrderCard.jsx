import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from './format.js';

export default function OrderCard({ order }) {
  return (
    <div
      data-testid="order-card"
      className="mt-3 rounded-xl border border-success bg-success/10 p-4"
    >
      <div className="flex items-center gap-2 text-success">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        <span className="text-xs font-medium uppercase tracking-wide">Order confirmed</span>
      </div>
      <p className="mt-1.5 font-display text-lg font-semibold tracking-tight">{order.orderId}</p>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="text-ink-soft">Total</span>
        <span className="font-medium tabular-nums">{formatPrice(order.total)}</span>
      </div>
      {order.status && (
        <p className="mt-1 text-xs capitalize text-ink-soft">Status: {order.status}</p>
      )}
    </div>
  );
}
