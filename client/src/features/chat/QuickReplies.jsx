import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

export default function QuickReplies({ replies, onSelect, disabled = false, align = 'end' }) {
  const reduced = useReducedMotion();
  if (!replies?.length) return null;
  return (
    <motion.div
      className={clsx('flex flex-wrap gap-2', align === 'center' ? 'justify-center' : 'justify-end')}
      initial={reduced ? false : 'hidden'}
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.03 } } }}
    >
      {replies.map((text) => (
        <motion.button
          key={text}
          type="button"
          data-testid="quick-reply"
          dir="auto"
          disabled={disabled}
          onClick={() => onSelect(text)}
          variants={{ hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.16 }}
          className="rounded-full border border-line bg-transparent px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50"
        >
          {text}
        </motion.button>
      ))}
    </motion.div>
  );
}
