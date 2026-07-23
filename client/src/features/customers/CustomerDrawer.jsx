import { useNavigate } from 'react-router-dom';
import Drawer from '../../components/Drawer.jsx';
import Badge from '../../components/Badge.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ChannelIcon from '../../components/ChannelIcon.jsx';
import { useCustomer } from '../../api/customers.js';
import { formatPrice, formatDate } from '../../lib/format.js';
import { ORDER_STATUS_TONES } from '../../lib/status.js';

const LANGUAGE_LABELS = { en: 'English', ur: 'Urdu', 'roman-ur': 'Roman Urdu' };

function Section({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      {children}
    </div>
  );
}

export default function CustomerDrawer({ customerId, onClose }) {
  const { data, isPending, isError } = useCustomer(customerId);
  const navigate = useNavigate();

  const customer = data?.customer ?? data;
  const orders = data?.orders ?? customer?.orders ?? [];
  const prefs = customer?.preferences ?? {};

  return (
    <Drawer open={!!customerId} onClose={onClose} title={customer?.name ?? 'Customer'} testId="customer-drawer">
      {isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : isError || !customer ? (
        <EmptyState title="Couldn't load this customer" description="The server may be offline." />
      ) : (
        <div className="flex flex-col gap-6">
          <Section label="Profile">
            <div className="flex flex-col gap-1 text-sm">
              <span className="flex items-center gap-2 font-medium">
                {customer.name}
                <ChannelIcon channel={customer.channelHint} />
              </span>
              {customer.phone && <span className="text-ink-soft tabular-nums">{customer.phone}</span>}
              {customer.instagramId && <span className="text-ink-soft">@{customer.instagramId}</span>}
              {(customer.city || customer.address?.city) && (
                <span className="text-ink-soft">{customer.city ?? customer.address?.city}</span>
              )}
              <span className="text-xs text-ink-soft">
                Joined {formatDate(customer.createdAt)} ·{' '}
                {LANGUAGE_LABELS[customer.language] ?? customer.language ?? '—'}
              </span>
            </div>
          </Section>

          <Section label="Preferences">
            <div className="flex flex-wrap gap-2">
              {prefs.favoriteColors?.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium capitalize"
                >
                  <span className={`swatch swatch-${c}`} aria-hidden="true" />
                  {c}
                </span>
              ))}
              {prefs.sizes?.map((s) => (
                <span key={s} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium">
                  {s}
                </span>
              ))}
              {prefs.budgetMax != null && (
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium tabular-nums">
                  under {formatPrice(prefs.budgetMax)}
                </span>
              )}
              {prefs.categories?.map((c) => (
                <span key={c} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium capitalize">
                  {c}
                </span>
              ))}
              {!prefs.favoriteColors?.length &&
                !prefs.sizes?.length &&
                prefs.budgetMax == null &&
                !prefs.categories?.length && (
                  <p className="text-sm text-ink-soft">Nothing learned yet.</p>
                )}
            </div>
          </Section>

          <Section label={`Orders (${orders.length})`}>
            {orders.length === 0 ? (
              <p className="text-sm text-ink-soft">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-line rounded-xl border border-line">
                {orders.map((o) => (
                  <li key={o.id ?? o._id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/orders?open=${o.id ?? o._id}`)}
                      className="flex w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      data-testid="customer-order"
                    >
                      <span className="font-display text-sm font-medium">{o.orderId}</span>
                      <span className="text-sm tabular-nums">{formatPrice(o.total)}</span>
                      <Badge tone={ORDER_STATUS_TONES[o.status]} className="capitalize">
                        {o.status}
                      </Badge>
                      <span className="text-xs text-ink-soft">{formatDate(o.createdAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </Drawer>
  );
}
