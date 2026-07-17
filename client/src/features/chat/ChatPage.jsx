import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, SquarePen } from 'lucide-react';
import { useThemeStore, useResolvedTheme } from '../../stores/theme.js';
import { useChatHistory, useSendChatMessage } from '../../api/chat.js';
import { getSessionId, resetSessionId } from './session.js';
import Skeleton from '../../components/Skeleton.jsx';
import MessageBubble from './MessageBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import QuickReplies from './QuickReplies.jsx';
import ChatInput from './ChatInput.jsx';

const STARTERS = [
  'New Arrivals',
  'Show black dresses',
  'Delivery info',
  'Track my order',
  'شلوار قمیض دکھائیں',
];

function ChatHeader({ onNewChat }) {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = useResolvedTheme();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur-sm sm:px-6">
      <Link
        to="/chat"
        className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="font-display text-xl font-semibold tracking-tight">FashionHub</span>
        <span className="ml-2.5 hidden text-xs uppercase tracking-wide text-ink-soft sm:inline">
          AI Sales Assistant
        </span>
      </Link>
      <div className="flex items-center gap-1">
        <button
          type="button"
          data-testid="new-chat"
          onClick={onNewChat}
          className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SquarePen className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">New chat</span>
          <span className="sr-only sm:hidden">New chat</span>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
        <Link
          to="/login"
          className="rounded-lg px-2.5 py-1.5 text-xs text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-12 w-3/5 rounded-xl" />
      <Skeleton className="ml-auto h-16 w-4/5 rounded-xl" />
      <Skeleton className="h-12 w-1/2 rounded-xl" />
      <Skeleton className="ml-auto h-12 w-2/3 rounded-xl" />
    </div>
  );
}

function WelcomeState({ onSelect }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-display text-3xl/tight font-medium tracking-tight">
        Welcome to FashionHub
      </h1>
      <p className="mt-3 max-w-sm text-base text-ink-soft">
        Ask me about outfits, sizes, prices, delivery — or place an order right here.
      </p>
      <div className="mt-8 max-w-md">
        <QuickReplies replies={STARTERS} onSelect={onSelect} align="center" />
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState(getSessionId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const seededRef = useRef(null);
  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);

  const history = useChatHistory(sessionId);
  const send = useSendChatMessage();

  useEffect(() => {
    if (history.data && seededRef.current !== sessionId) {
      seededRef.current = sessionId;
      setMessages(
        (history.data.messages ?? []).map((m, i) => ({
          id: `h-${i}`,
          role: m.role,
          text: m.text,
          products: m.products ?? [],
          order: null,
          status: 'sent',
        }))
      );
    }
  }, [history.data, sessionId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && nearBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight });
    }
  }, [messages, send.isPending]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  function sendMessage(text, retryId = null) {
    const trimmed = text.trim();
    if (!trimmed || send.isPending) return;
    const id = retryId ?? crypto.randomUUID();
    nearBottomRef.current = true;
    setMessages((prev) =>
      retryId
        ? prev.map((m) => (m.id === retryId ? { ...m, status: 'pending' } : m))
        : [...prev, { id, role: 'customer', text: trimmed, status: 'pending' }]
    );
    if (input.trim() === trimmed) setInput('');
    send.mutate(
      { sessionId, message: trimmed },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev.map((m) => (m.id === id ? { ...m, status: 'sent' } : m)),
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              text: data.reply,
              products: data.products ?? [],
              quickReplies: data.quickReplies ?? [],
              order: data.order ?? null,
              status: 'sent',
            },
          ]);
        },
        onError: () => {
          setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'failed' } : m)));
          setInput(trimmed);
        },
      }
    );
  }

  function handleNewChat() {
    const next = resetSessionId();
    seededRef.current = next;
    setSessionId(next);
    setMessages([]);
    setInput('');
    nearBottomRef.current = true;
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const showWelcome = !history.isLoading && messages.length === 0;

  return (
    <div className="flex h-dvh flex-col">
      <ChatHeader onNewChat={handleNewChat} />
      <main
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
        aria-label="Chat messages"
      >
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 py-6">
          {history.isLoading ? (
            <HistorySkeleton />
          ) : showWelcome ? (
            <WelcomeState onSelect={sendMessage} />
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onSelectProduct={sendMessage}
                  onRetry={(msg) => sendMessage(msg.text, msg.id)}
                />
              ))}
              {send.isPending && <TypingIndicator />}
              {!send.isPending && lastAssistant?.quickReplies?.length > 0 && (
                <QuickReplies replies={lastAssistant.quickReplies} onSelect={sendMessage} />
              )}
            </div>
          )}
        </div>
      </main>
      <ChatInput value={input} onChange={setInput} onSend={() => sendMessage(input)} sending={send.isPending} />
    </div>
  );
}
