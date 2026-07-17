import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { Table, THead, TBody, TRow, TCell } from '../../components/Table.jsx';
import { useProducts } from '../../api/products.js';

const COLUMNS = ['Product', 'Category', 'Price', 'Stock', 'Status'];

function totalStock(stock) {
  if (Array.isArray(stock)) return stock.reduce((sum, entry) => sum + (entry.qty ?? 0), 0);
  return stock ?? 0;
}

function stockTone(stock) {
  if (stock === 0) return 'danger';
  if (stock <= 5) return 'warn';
  return 'success';
}

function stockLabel(stock) {
  if (stock === 0) return 'Out of stock';
  if (stock <= 5) return 'Low stock';
  return 'In stock';
}

export default function ProductsPage() {
  const { data: products, isPending, isError, refetch } = useProducts();

  return (
    <>
      <PageHeader
        title="Products"
        description="Your catalog as the assistant sees it."
        action={<Button size="sm">Add product</Button>}
      />
      {isPending ? (
        <Table>
          <THead columns={COLUMNS} />
          <TBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TRow key={i}>
                {COLUMNS.map((col) => (
                  <TCell key={col}>
                    <Skeleton className="h-4 w-24" />
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
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product and the assistant will start recommending it."
          action={<Button>Add product</Button>}
        />
      ) : (
        <Table>
          <THead columns={COLUMNS} />
          <TBody>
            {products.map((p) => {
              const qty = totalStock(p.stock);
              return (
                <TRow key={p._id ?? p.id}>
                  <TCell className="font-medium">{p.name}</TCell>
                  <TCell className="text-ink-soft">{p.category ?? '—'}</TCell>
                  <TCell>{p.price != null ? `Rs ${Number(p.price).toLocaleString()}` : '—'}</TCell>
                  <TCell>{qty}</TCell>
                  <TCell>
                    <Badge tone={stockTone(qty)}>{stockLabel(qty)}</Badge>
                  </TCell>
                </TRow>
              );
            })}
          </TBody>
        </Table>
      )}
    </>
  );
}
