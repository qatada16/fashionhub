export default function TypingIndicator() {
  return (
    <div className="flex justify-end" data-testid="typing-indicator">
      <div
        className="flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3"
        role="status"
        aria-label="Assistant is typing"
      >
        <span className="size-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.32s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.16s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-accent" />
      </div>
    </div>
  );
}
