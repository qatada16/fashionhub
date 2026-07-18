import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import Pagination from '../../components/Pagination.jsx';
import FilterChips from '../../components/FilterChips.jsx';
import ExportButton from '../../components/ExportButton.jsx';
import ChannelIcon from '../../components/ChannelIcon.jsx';
import { Table, THead, TBody, TRow, TCell } from '../../components/Table.jsx';
import { useOrders } from '../../api/orders.js';
import { useDebounce } from '../../lib/useDebounce.js';
import { formatPrice, formatDate } from '../../lib/format.js';
import { ORDER_STATUS_TONES } from '../../lib/status.js';
import OrderDrawer from './OrderDrawer.jsx';

const COLUMNS = ['Order', 'Customer', 'Items', 'Total', 'Channel', 'Status', 'Date'];
const STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const page = Number(params.get('page') ?? 1);
  const openId = params.get('open');
  const [searchText, setSearchText] = useState(params.get('search') ?? '');
  const search = useDebounce(searchText, 300);

  useEffect(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (search) next.set('search', search);
        else next.delete('search');
        if (prev.get('search') !== (search || null)) next.delete('page');
        return next;
      },
      { replace: true }
    );
  }, [search, setParams]);

  const { data, isPending, isError, refetch } = useOrders({
    page,
    ...(status && { status }),
    ...(search && { search }),
  });

  function setParam(key, value) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page' && key !== 'open') next.delete('page');
      return next;
    });
  }

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Orders"
        description="Track and fulfil customer orders."
        action={<ExportButton type="orders" />}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips
          label="Filter by status"
          options={STATUSES}
          value={status}
          onChange={(v) => setParam('status', v)}
        />
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Order id or customer…"
            aria-label="Search orders"
            data-testid="orders-search"
            className="h-9 w-full rounded-lg bg-surface-2 pl-9 pr-3 text-sm placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {isPending ? (
        <Table>
          <THead columns={COLUMNS} />
          <TBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TRow key={i}>
                {COLUMNS.map((col) => (
                  <TCell key={col}>
                    <Skeleton className="h-4 w-20" />
                  </TCell>
                ))}
              </TRow>
            ))}
          </TBody>
        </Table>
      ) : isError ? (
        <EmptyState
          title="Couldn't load orders"
          description="The server may be offline. Check that the API is running, then try again."
          action={
            <Button variant="ghost" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={status || search ? 'No orders match' : 'No orders yet'}
          description={
            status || search
              ? 'Try a different filter or search.'
              : 'Orders placed through the assistant or web chat will show up here.'
          }
        />
      ) : (
        <>
          <Table>
            <THead columns={COLUMNS} />
            <TBody>
              {items.map((o) => (
                <TRow
                  key={o.id}
                  onClick={() => setParam('open', o.id)}
                  className="cursor-pointer"
                  data-testid="order-row"
                >
                  <TCell className="font-display font-medium">{o.orderId}</TCell>
                  <TCell>{o.customer?.name ?? '—'}</TCell>
                  <TCell>{o.itemsCount}</TCell>
                  <TCell>{formatPrice(o.total)}</TCell>
                  <TCell>
                    <ChannelIcon channel={o.channel} />
                  </TCell>
                  <TCell>
                    <Badge tone={ORDER_STATUS_TONES[o.status]} className="capitalize">
                      {o.status}
                    </Badge>
                  </TCell>
                  <TCell className="text-ink-soft">{formatDate(o.createdAt)}</TCell>
                </TRow>
              ))}
            </TBody>
          </Table>
          <Pagination
            page={data.page ?? page}
            totalPages={data.totalPages}
            total={data.total}
            onPage={(p) => setParam('page', String(p))}
          />
        </>
      )}

      <OrderDrawer orderId={openId} onClose={() => setParam('open', '')} />
    </>
  );
}
