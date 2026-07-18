import { Plus, Trash2 } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Select from '../../components/Select.jsx';

export default function StockMatrix({ stock, sizes, colors, onChange }) {
  function update(index, patch) {
    onChange(stock.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  const canAdd = sizes.length > 0 && colors.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Stock</p>
      {stock.length === 0 && (
        <p className="text-xs text-ink-soft">
          {canAdd ? 'No stock rows yet.' : 'Add sizes and colors first, then define stock per variant.'}
        </p>
      )}
      {stock.map((row, i) => (
        <div key={i} className="flex items-center gap-2" data-testid="stock-row">
          <Select
            aria-label="Size"
            value={row.size}
            options={sizes}
            onChange={(e) => update(i, { size: e.target.value })}
            className="flex-1"
          />
          <Select
            aria-label="Color"
            value={row.color}
            options={colors}
            onChange={(e) => update(i, { color: e.target.value })}
            className="flex-1"
          />
          <input
            type="number"
            min="0"
            aria-label="Quantity"
            value={row.qty}
            onChange={(e) => update(i, { qty: e.target.value })}
            className="h-10 w-20 rounded-lg bg-surface-2 px-3 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            aria-label="Remove stock row"
            onClick={() => onChange(stock.filter((_, x) => x !== i))}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!canAdd}
        onClick={() => onChange([...stock, { size: sizes[0], color: colors[0], qty: 0 }])}
        data-testid="stock-add"
        className="self-start"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add variant
      </Button>
    </div>
  );
}
