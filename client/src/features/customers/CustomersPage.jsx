import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import Pagination from '../../components/Pagination.jsx';
import ExportButton from '../../components/ExportButton.jsx';
import ChannelIcon from '../../components/ChannelIcon.jsx';
import { Table, THead, TBody, TRow, TCell } from '../../components/Table.jsx';
import { useCustomers } from '../../api/customers.js';
import { useDebounce } from '../../lib/useDebounce.js';
import { formatDate } from '../../lib/format.js';
import CustomerDrawer from './CustomerDrawer.jsx';

const COLUMNS = ['Customer', 'Contact', 'City', 'Orders', 'Language', 'Joined'];
const LANGUAGE_LABELS = { en: 'EN', ur: 'UR', 'roman-ur': 'Roman UR' };

export default function CustomersPage() {
  const [params, setParams] = useSearchParams();
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

  const { data, isPending, isError, refetch } = useCustomers({
    page,
    ...(search && { search }),
  });

  function setParam(key, value) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  }

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone the assistant has talked to."
        action={<ExportButton type="customers" />}
      />

      <div className="relative mb-4 sm:w-64">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Name or phone…"
          aria-label="Search customers"
          data-testid="customers-search"
          className="h-9 w-full rounded-lg bg-surface-2 pl-9 pr-3 text-sm placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent"
        />
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
          title="Couldn't load customers"
          description="The server may be offline. Check that the API is running, then try again."
          action={
            <Button variant="ghost" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={search ? 'No customers match' : 'No customers yet'}
          description={
            search
              ? 'Try a different name or phone number.'
              : 'Customer profiles are created automatically from Instagram, WhatsApp, and web chat.'
          }
        />
      ) : (
        <>
          <Table>
            <THead columns={COLUMNS} />
            <TBody>
              {items.map((c) => (
                <TRow
                  key={c.id}
                  onClick={() => setParam('open', c.id)}
                  className="cursor-pointer"
                  data-testid="customer-row"
                >
                  <TCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {c.name || 'Unknown'}
                      <ChannelIcon channel={c.channelHint} />
                    </span>
                  </TCell>
                  <TCell className="text-ink-soft">
                    {c.phone ?? (c.instagramId ? `@${c.instagramId}` : '—')}
                  </TCell>
                  <TCell className="text-ink-soft">{c.city ?? '—'}</TCell>
                  <TCell>{c.ordersCount ?? 0}</TCell>
                  <TCell>
                    <Badge>{LANGUAGE_LABELS[c.language] ?? c.language ?? '—'}</Badge>
                  </TCell>
                  <TCell className="text-ink-soft">{formatDate(c.createdAt)}</TCell>
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

      <CustomerDrawer customerId={openId} onClose={() => setParam('open', '')} />
    </>
  );
}
