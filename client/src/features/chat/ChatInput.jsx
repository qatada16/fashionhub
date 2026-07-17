import { SendHorizonal } from 'lucide-react';

export default function ChatInput({ value, onChange, onSend, sending }) {
  const canSend = value.trim().length > 0 && !sending;

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  }

  return (
    <div className="border-t border-line bg-canvas/90 backdrop-blur-sm">
      <form
        className="mx-auto flex w-full max-w-2xl items-end gap-2 px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSend();
        }}
      >
        <textarea
          data-testid="chat-input"
          rows={1}
          dir="auto"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about styles, sizes, delivery…"
          aria-label="Message"
          className="min-h-11 max-h-32 flex-1 resize-none rounded-lg bg-surface-2 px-4 py-2.5 text-base outline-none field-sizing-content placeholder:text-ink-soft focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          data-testid="chat-send"
          disabled={!canSend}
          aria-label="Send message"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50"
        >
          <SendHorizonal className="size-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
