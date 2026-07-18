import { useState } from 'react';
import { X } from 'lucide-react';

export default function ChipInput({ label, values, onChange, placeholder, testId }) {
  const [text, setText] = useState('');

  function add() {
    const v = text.trim().toLowerCase();
    if (v && !values.includes(v)) onChange([...values, v]);
    setText('');
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-2 p-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium capitalize"
          >
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-ink-soft transition-colors hover:text-danger"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={text}
          data-testid={testId}
          aria-label={label}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          className="h-7 min-w-24 flex-1 bg-transparent px-1 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}
