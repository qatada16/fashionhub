import { formatPrice, discountedPrice } from './format.js';

export default function ProductMiniCard({ product, onSelect }) {
  const hasDiscount = product.discount > 0;
  return (
    <button
      type="button"
      data-testid="product-card"
      onClick={() => onSelect(`Tell me more about ${product.name}`)}
      aria-label={`Tell me more about ${product.name}`}
      className="w-36 shrink-0 rounded-xl border border-line bg-surface p-2 text-left transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="aspect-[3/4] w-full rounded-lg bg-surface-2 object-cover"
      />
      <p className="mt-2 line-clamp-2 font-display text-sm font-medium leading-snug">
        {product.name}
      </p>
      <p className="mt-1 text-sm tabular-nums">
        {hasDiscount ? (
          <>
            <span className="mr-1.5 text-xs text-ink-soft line-through">
              {formatPrice(product.price)}
            </span>
            <span className="font-medium text-accent">
              {formatPrice(discountedPrice(product.price, product.discount))}
            </span>
          </>
        ) : (
          <span className="font-medium">{formatPrice(product.price)}</span>
        )}
      </p>
    </button>
  );
}
