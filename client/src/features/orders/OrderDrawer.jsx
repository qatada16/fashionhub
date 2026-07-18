import { useState } from 'react';
import { Pencil } from 'lucide-react';
import Drawer from '../../components/Drawer.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Select from '../../components/Select.jsx';
import Input from '../../components/Input.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ChannelIcon from '../../components/ChannelIcon.jsx';
import { toast } from '../../components/Toast.jsx';
import { useOrder, useUpdateOrder } from '../../api/orders.js';
import { formatPrice, formatDate } from '../../lib/format.js';
import { ORDER_STATUS_TONES, PAYMENT_STATUSES } from '../../lib/status.js';
import StatusStepper from './StatusStepper.jsx';

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-16 w-full" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export default function OrderDrawer({ orderId, onClose }) {
  const { data: order, isPending, isError } = useOrder(orderId);
  const update = useUpdateOrder();
  const [editingTracking, setEditingTracking] = useState(false);
  const [tracking, setTracking] = useState('');

  async function patch(body, label) {
    try {
      await update.mutateAsync({ id: orderId, ...body });
      toast(label);
    } catch {
      toast("Couldn't update the order", 'danger');
    }
  }

  const addr = order?.deliveryAddress;
  const customer = order?.customer;

  return (
    <Drawer
      open={!!orderId}
      onClose={onClose}
      title={order?.orderId ?? 'Order'}
      testId="order-drawer"
    >
      {isPending ? (
        <DetailSkeleton />
      ) : isError || !order ? (
        <EmptyState title="Couldn't load this order" description="The server may be offline." />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={ORDER_STATUS_TONES[order.status]} className="capitalize">
              {order.status}
            </Badge>
            <ChannelIcon channel={order.channel} />
            <span className="text-xs text-ink-soft">{formatDate(order.createdAt)}</span>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Progress</p>
            <StatusStepper
              status={order.status}
              disabled={update.isPending}
              onStep={(step) => patch({ status: step }, `Order marked ${step}`)}
            />
            {['pending', 'confirmed', 'packed', 'shipped'].includes(order.status) && (
              <div className="mt-3 flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => patch({ status: 'cancelled' }, 'Order cancelled')}
                  data-testid="order-cancel"
                >
                  Cancel order
                </Button>
              </div>
            )}
            {order.status === 'delivered' && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => patch({ status: 'returned' }, 'Order marked returned')}
                  data-testid="order-return"
                >
                  Mark returned
                </Button>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Items</p>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {order.items?.map((item, i) => (
                <li key={i} className="flex items-center gap-3 p-3">
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt=""
                      loading="lazy"
                      className="size-12 shrink-0 rounded-lg bg-surface-2 object-cover"
                    />
                  ) : (
                    <span className="block size-12 shrink-0 rounded-lg bg-surface-2" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-medium">{item.name}</p>
                    <p className="text-xs capitalize text-ink-soft">
                      {[item.size, item.color].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums">
                    {item.qty} × {formatPrice(item.unitPrice)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-surface-2 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Subtotal</span>
              <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-ink-soft">Delivery</span>
              <span className="tabular-nums">
                {order.deliveryCharges === 0 ? 'Free' : formatPrice(order.deliveryCharges)}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-2 font-medium">
              <span>Total</span>
              <span className="font-display tabular-nums">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Customer</p>
            <p className="text-sm font-medium">{customer?.name ?? '—'}</p>
            {customer?.phone && <p className="text-sm text-ink-soft">{customer.phone}</p>}
            {addr && (
              <p className="mt-1 text-sm text-ink-soft">
                {[addr.street, addr.city, addr.province, addr.postalCode].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Payment"
              value={order.paymentStatus}
              options={PAYMENT_STATUSES}
              disabled={update.isPending}
              onChange={(e) => patch({ paymentStatus: e.target.value }, 'Payment status updated')}
              data-testid="order-payment"
            />
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Tracking</p>
              {editingTracking ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    patch({ trackingNumber: tracking }, 'Tracking number saved');
                    setEditingTracking(false);
                  }}
                >
                  <Input
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    aria-label="Tracking number"
                    className="flex-1"
                  />
                  <Button size="sm" type="submit" className="self-end">
                    Save
                  </Button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTracking(order.trackingNumber ?? '');
                    setEditingTracking(true);
                  }}
                  className="flex h-10 items-center justify-between gap-2 rounded-lg bg-surface-2 px-3 text-sm transition-colors hover:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Edit tracking number"
                >
                  <span className={order.trackingNumber ? 'tabular-nums' : 'text-ink-soft'}>
                    {order.trackingNumber || 'Not set'}
                  </span>
                  <Pencil className="size-3.5 text-ink-soft" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
