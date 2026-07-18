import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import FilterChips from '../../components/FilterChips.jsx';
import { useConversations } from '../../api/conversations.js';
import ConversationList from './ConversationList.jsx';
import ThreadPane from './ThreadPane.jsx';

const CHANNELS = ['whatsapp', 'instagram', 'web'];

export default function ConversationsPage() {
  const [params, setParams] = useSearchParams();
  const channel = params.get('channel') ?? '';
  const openOnly = params.get('isOpen') === 'true';
  const selectedId = params.get('c');

  const { data, isPending, isError, refetch } = useConversations({
    ...(channel && { channel }),
    ...(openOnly && { isOpen: true }),
  });

  function setParam(key, value) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: key === 'c' }
    );
  }

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader title="Conversations" description="Every chat the assistant is handling." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterChips
          label="Filter by channel"
          options={CHANNELS}
          value={channel}
          onChange={(v) => setParam('channel', v)}
        />
        <span className="h-4 w-px bg-line" aria-hidden="true" />
        <FilterChips
          label="Open only"
          options={[{ value: 'true', label: 'Open only' }]}
          value={openOnly ? 'true' : ''}
          onChange={(v) => setParam('isOpen', v)}
        />
      </div>

      <div className="flex h-[calc(100dvh-16rem)] min-h-96 overflow-hidden rounded-xl border border-line bg-surface">
        <div
          className={clsx(
            'w-full flex-col overflow-hidden border-line md:flex md:w-80 md:shrink-0 md:border-r',
            selectedId ? 'hidden' : 'flex'
          )}
        >
          {isPending ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="Couldn't load conversations"
              description="The server may be offline."
              action={
                <Button variant="ghost" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="No conversations"
              description={
                channel || openOnly
                  ? 'Nothing matches these filters.'
                  : 'Chats from Instagram, WhatsApp, and the web will appear here.'
              }
            />
          ) : (
            <ConversationList
              items={items}
              selectedId={selectedId}
              onSelect={(id) => setParam('c', id)}
            />
          )}
        </div>

        <div className={clsx('min-w-0 flex-1 md:flex', selectedId ? 'flex' : 'hidden')}>
          {selectedId ? (
            <ThreadPane conversationId={selectedId} onBack={() => setParam('c', '')} />
          ) : (
            <div className="hidden flex-1 items-center justify-center md:flex">
              <EmptyState
                title="Pick a conversation"
                description="Select a chat from the list to read the full thread."
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
