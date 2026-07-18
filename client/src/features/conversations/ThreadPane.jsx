import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ChannelIcon from '../../components/ChannelIcon.jsx';
import { toast } from '../../components/Toast.jsx';
import { useConversation, useToggleConversation } from '../../api/conversations.js';
import { formatPrice, relativeTime } from '../../lib/format.js';
import { SENTIMENT_TONES } from '../../lib/status.js';

function ProductSnapshot({ product }) {
  return (
    <div className="w-28 shrink-0 rounded-xl border border-line bg-surface p-1.5">
      <img
        src={product.image ?? product.images?.[0]}
        alt={product.name}
        loading="lazy"
        className="aspect-[3/4] w-full rounded-lg bg-surface-2 object-cover"
      />
      <p className="mt-1 line-clamp-2 font-display text-xs font-medium leading-snug">{product.name}</p>
      <p className="text-xs text-ink-soft tabular-nums">{formatPrice(product.price)}</p>
    </div>
  );
}

export default function ThreadPane({ conversationId, onBack }) {
  const { data, isPending, isError } = useConversation(conversationId);
  const toggle = useToggleConversation();
  const bottomRef = useRef(null);

  const messages = data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  async function onToggle() {
    try {
      await toggle.mutateAsync({ id: conversationId, isOpen: !data.isOpen });
      toast(data.isOpen ? 'Conversation closed' : 'Conversation reopened');
    } catch {
      toast("Couldn't update the conversation", 'danger');
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col" data-testid="thread-pane">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="flex size-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        >
          <ArrowLeft className="size-4" />
        </button>
        {isPending ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate font-display text-sm font-medium">
              {data?.customer?.name || 'Visitor'}
            </span>
            {data && <ChannelIcon channel={data.channel} />}
            {data && (
              <button
                type="button"
                data-testid="conversation-toggle"
                onClick={onToggle}
                disabled={toggle.isPending}
                aria-pressed={data.isOpen}
                className={clsx(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  data.isOpen
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line text-ink-soft hover:bg-surface-2'
                )}
              >
                {data.isOpen ? 'Open' : 'Closed'}
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isPending ? (
          <>
            <Skeleton className="h-12 w-3/5" />
            <Skeleton className="ml-auto h-12 w-3/5" />
            <Skeleton className="h-12 w-2/5" />
          </>
        ) : isError ? (
          <EmptyState title="Couldn't load this conversation" description="The server may be offline." />
        ) : messages.length === 0 ? (
          <EmptyState title="No messages yet" description="This conversation is empty." />
        ) : (
          messages.map((m, i) => {
            const isCustomer = m.role === 'customer';
            return (
              <div key={i} className={isCustomer ? 'flex justify-start' : 'flex justify-end'}>
                <div className="max-w-[85%]">
                  <div
                    dir="auto"
                    className={
                      isCustomer
                        ? 'rounded-xl rounded-bl-sm bg-surface-2 px-3.5 py-2 text-sm whitespace-pre-wrap'
                        : 'rounded-xl rounded-br-sm border border-accent/30 bg-accent/10 px-3.5 py-2 text-sm whitespace-pre-wrap'
                    }
                  >
                    {m.text}
                  </div>
                  {isCustomer && (m.intent || m.sentiment) && (
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-soft">
                      {m.intent && <span>{m.intent.replaceAll('_', ' ')}</span>}
                      {m.sentiment && (
                        <Badge tone={SENTIMENT_TONES[m.sentiment]} className="px-1.5 text-[10px]">
                          {m.sentiment}
                        </Badge>
                      )}
                      <span>{relativeTime(m.createdAt)}</span>
                    </p>
                  )}
                  {m.products?.length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Suggested products">
                      {m.products.map((p, j) => (
                        <ProductSnapshot key={p.id ?? j} product={p} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
