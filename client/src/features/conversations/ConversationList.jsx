import clsx from 'clsx';
import Badge from '../../components/Badge.jsx';
import ChannelIcon from '../../components/ChannelIcon.jsx';
import { relativeTime } from '../../lib/format.js';
import { SENTIMENT_TONES } from '../../lib/status.js';

export default function ConversationList({ items, selectedId, onSelect }) {
  return (
    <ul className="divide-y divide-line overflow-y-auto">
      {items.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            data-testid="conversation-item"
            onClick={() => onSelect(c.id)}
            aria-current={selectedId === c.id ? 'true' : undefined}
            className={clsx(
              'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
              selectedId === c.id ? 'bg-accent/10' : 'hover:bg-surface-2'
            )}
          >
            <div className="flex items-center gap-2">
              {c.isOpen && <span className="size-2 shrink-0 rounded-full bg-accent" aria-label="Open" />}
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {c.customer?.name || 'Visitor'}
              </span>
              <ChannelIcon channel={c.channel} className="size-3.5" />
              <span className="shrink-0 text-xs text-ink-soft tabular-nums">
                {relativeTime(c.lastMessageAt)}
              </span>
            </div>
            <p className="truncate text-xs text-ink-soft">
              {c.lastMessage?.role === 'assistant' && <span className="text-accent">AI: </span>}
              {c.lastMessage?.text ?? '—'}
            </p>
            <div className="flex gap-1.5">
              {c.lastIntent && <Badge className="text-[10px]">{c.lastIntent.replaceAll('_', ' ')}</Badge>}
              {c.lastSentiment && (
                <Badge tone={SENTIMENT_TONES[c.lastSentiment]} className="text-[10px]">
                  {c.lastSentiment}
                </Badge>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
