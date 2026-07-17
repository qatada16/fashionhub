import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import ProductMiniCard from './ProductMiniCard.jsx';
import OrderCard from './OrderCard.jsx';

export default function MessageBubble({ message, onSelectProduct, onRetry }) {
  const reduced = useReducedMotion();
  const isCustomer = message.role === 'customer';

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: isCustomer ? -8 : 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={isCustomer ? 'flex justify-start' : 'flex justify-end'}
      data-testid={isCustomer ? 'message-customer' : 'message-assistant'}
    >
      <div className={isCustomer ? 'max-w-[85%]' : 'max-w-[85%] sm:max-w-[90%]'}>
        <div
          dir="auto"
          className={
            isCustomer
              ? 'rounded-xl rounded-bl-sm bg-surface-2 px-4 py-2.5 text-base whitespace-pre-wrap'
              : 'rounded-xl rounded-br-sm border border-accent/30 bg-accent/10 px-4 py-2.5 text-base whitespace-pre-wrap'
          }
        >
          {message.text}
        </div>
        {message.products?.length > 0 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1" role="list" aria-label="Suggested products">
            {message.products.map((p) => (
              <ProductMiniCard key={p.id ?? p.slug} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        )}
        {message.order && <OrderCard order={message.order} />}
        {message.status === 'failed' && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-danger">
            <span>Failed to send</span>
            <button
              type="button"
              data-testid="retry-send"
              onClick={() => onRetry(message)}
              className="inline-flex items-center gap-1 rounded-full border border-danger/40 px-2 py-0.5 font-medium transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
