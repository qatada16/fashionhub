import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Pencil, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import Pagination from '../../components/Pagination.jsx';
import FilterChips from '../../components/FilterChips.jsx';
import ExportButton from '../../components/ExportButton.jsx';
import { Table, THead, TBody, TRow, TCell } from '../../components/Table.jsx';
import { useProducts } from '../../api/products.js';
import { useDebounce } from '../../lib/useDebounce.js';
import { formatPrice } from '../../lib/format.js';
import ProductDrawer, { CATEGORIES } from './ProductDrawer.jsx';

const COLUMNS = ['', 'Product', 'Category', 'Price', 'Discount', 'Stock', 'Status', ''];

function totalStock(stock) {
  if (Array.isArray(stock)) return stock.reduce((sum, entry) => sum + (entry.qty ?? 0), 0);
  return stock ?? 0;
}

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const page = Number(params.get('page') ?? 1);
  const [searchText, setSearchText] = useState(params.get('search') ?? '');
  const search = useDebounce(searchText, 300);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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

  const { data, isPending, isError, refetch } = useProducts({
    page,
    ...(search && { search }),
    ...(category && { category }),
  });

  function setParam(key, value) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  }

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setDrawerOpen(true);
  }

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Products"
        description="Your catalog as the assistant sees it."
        action={
          <div className="flex gap-2">
            <ExportButton type="products" />
            <Button size="sm" onClick={openCreate} data-testid="add-product">
              <Plus className="size-4" aria-hidden="true" />
              Add product
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips
          label="Filter by category"
          options={CATEGORIES}
          value={category}
          onChange={(v) => setParam('category', v)}
        />
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            data-testid="products-search"
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
                <TCell>
                  <Skeleton className="size-10" />
                </TCell>
                {COLUMNS.slice(1).map((_, j) => (
                  <TCell key={j}>
                    <Skeleton className="h-4 w-20" />
                  </TCell>
                ))}
              </TRow>
            ))}
          </TBody>
        </Table>
      ) : isError ? (
        <EmptyState
          title="Couldn't load products"
          description="The server may be offline. Check that the API is running, then try again."
          action={
            <Button variant="ghost" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={search || category ? 'No products match' : 'No products yet'}
          description={
            search || category
              ? 'Try a different search or clear the filters.'
              : 'Add your first product and the assistant will start recommending it.'
          }
          action={
            search || category ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchText('');
                  setParams({}, { replace: true });
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button onClick={openCreate}>Add product</Button>
            )
          }
        />
      ) : (
        <>
          <Table>
            <THead columns={COLUMNS} />
            <TBody>
              {items.map((p) => {
                const qty = totalStock(p.stock);
                return (
                  <TRow
                    key={p._id ?? p.id}
                    onClick={() => openEdit(p)}
                    className="cursor-pointer"
                    data-testid="product-row"
                  >
                    <TCell className="w-14">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          loading="lazy"
                          className="size-10 rounded-lg bg-surface-2 object-cover"
                        />
                      ) : (
                        <span className="block size-10 rounded-lg bg-surface-2" />
                      )}
                    </TCell>
                    <TCell className="font-medium">{p.name}</TCell>
                    <TCell className="capitalize text-ink-soft">{p.category ?? '—'}</TCell>
                    <TCell>{formatPrice(p.price)}</TCell>
                    <TCell>
                      {p.discount > 0 ? <Badge tone="accent">-{p.discount}%</Badge> : <span className="text-ink-soft">—</span>}
                    </TCell>
                    <TCell className={qty === 0 ? 'text-danger' : qty <= 5 ? 'text-warn' : ''}>
                      {qty}
                    </TCell>
                    <TCell>
                      <Badge tone={p.isActive ? 'success' : 'neutral'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TCell>
                    <TCell className="w-10">
                      <button
                        type="button"
                        aria-label={`Edit ${p.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(p);
                        }}
                        className="flex size-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </TCell>
                  </TRow>
                );
              })}
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

      <ProductDrawer open={drawerOpen} product={editing} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
