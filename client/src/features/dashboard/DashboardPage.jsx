import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { Table, THead, TBody, TRow, TCell } from '../../components/Table.jsx';
import { useStats } from '../../api/stats.js';
import { formatPrice, formatDate } from '../../lib/format.js';
import { ORDER_STATUS_TONES } from '../../lib/status.js';
import SalesChart from './SalesChart.jsx';

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-line bg-surface p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-8 w-28" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isPending, isError, refetch } = useStats();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <>
        <PageHeader title="Dashboard" description="Store performance at a glance." />
        <StatsSkeleton />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-48 w-full" />
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <Skeleton className="h-4 w-28" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="mt-3 h-12 w-full" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Dashboard" description="Store performance at a glance." />
        <EmptyState
          title="Couldn't load stats"
          description="The server may be offline. Check that the API is running, then try again."
          action={
            <Button variant="ghost" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </>
    );
  }

  const stats = data ?? {};

  return (
    <>
      <PageHeader title="Dashboard" description="Store performance at a glance." />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4" data-testid="stat-cards">
        <div data-testid="stat-revenue">
          <StatCard label="Revenue" value={formatPrice(stats.revenue ?? 0)} />
        </div>
        <div data-testid="stat-orders">
          <StatCard label="Orders" value={(stats.ordersCount ?? 0).toLocaleString()} />
        </div>
        <div data-testid="stat-customers">
          <StatCard label="Customers" value={(stats.customersCount ?? 0).toLocaleString()} />
        </div>
        <div className="rounded-xl border border-line bg-surface p-5" data-testid="stat-conversations">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Conversations</p>
          <p className="mt-2 font-display text-3xl/tight font-semibold tracking-tight tabular-nums">
            {(stats.conversationsCount ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-ink-soft tabular-nums">
            {stats.openConversations ?? 0} open now
          </p>
        </div>
      </div>

      {stats.lowStock?.length > 0 && (
        <Card className="mt-6 border-warn/40" title="Low stock" data-testid="low-stock-card">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden="true" />
            <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="text-ink-soft">
                  <span className="text-ink">{p.name}</span>{' '}
                  <span className="tabular-nums text-warn">{p.totalQty} left</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Sales — last 14 days" className="lg:col-span-2">
          {stats.salesByDay?.length ? (
            <SalesChart data={stats.salesByDay} />
          ) : (
            <EmptyState title="No sales yet" description="Sales will chart here as orders come in." />
          )}
        </Card>

        <Card title="Top products">
          {stats.topProducts?.length ? (
            <ul className="divide-y divide-line">
              {stats.topProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    className="size-10 shrink-0 rounded-lg bg-surface-2 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-ink-soft tabular-nums">{formatPrice(p.price)}</p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-soft tabular-nums">
                    {p.soldCount} sold
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Nothing sold yet" description="Best-sellers will rank here." />
          )}
        </Card>
      </div>

      <Card title="Recent orders" className="mt-6">
        {stats.recentOrders?.length ? (
          <Table className="border-0">
            <THead columns={['Order', 'Customer', 'Total', 'Status', 'Date']} />
            <TBody>
              {stats.recentOrders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/dashboard/orders?open=${o.id}`)}
                  className="cursor-pointer transition-colors hover:bg-surface-2"
                  data-testid="recent-order-row"
                >
                  <TCell className="font-display font-medium">{o.orderId}</TCell>
                  <TCell>{o.customerName}</TCell>
                  <TCell>{formatPrice(o.total)}</TCell>
                  <TCell>
                    <Badge tone={ORDER_STATUS_TONES[o.status]} className="capitalize">
                      {o.status}
                    </Badge>
                  </TCell>
                  <TCell className="text-ink-soft">{formatDate(o.createdAt)}</TCell>
                </tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState
            title="No orders yet"
            description="Orders placed through the assistant will show up here."
          />
        )}
      </Card>
    </>
  );
}
