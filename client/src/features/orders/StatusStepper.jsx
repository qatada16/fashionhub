import clsx from 'clsx';
import { Check } from 'lucide-react';
import { ORDER_STEPS } from '../../lib/status.js';

export default function StatusStepper({ status, onStep, disabled }) {
  const currentIndex = ORDER_STEPS.indexOf(status);
  const terminal = currentIndex === -1;

  return (
    <ol className="flex items-start" aria-label="Order status">
      {ORDER_STEPS.map((step, i) => {
        const done = !terminal && i <= currentIndex;
        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <span
                className={clsx(
                  'h-px flex-1',
                  i === 0 ? 'bg-transparent' : done ? 'bg-accent' : 'bg-line'
                )}
              />
              <button
                type="button"
                data-testid={`status-step-${step}`}
                aria-label={`Mark as ${step}`}
                aria-current={i === currentIndex ? 'step' : undefined}
                disabled={disabled || terminal}
                onClick={() => onStep(step)}
                className={clsx(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none',
                  done
                    ? 'border-accent bg-accent text-accent-ink'
                    : 'border-line bg-surface text-ink-soft hover:border-accent hover:text-accent',
                  terminal && 'opacity-50'
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
              </button>
              <span
                className={clsx(
                  'h-px flex-1',
                  i === ORDER_STEPS.length - 1
                    ? 'bg-transparent'
                    : !terminal && i < currentIndex
                      ? 'bg-accent'
                      : 'bg-line'
                )}
              />
            </div>
            <span
              className={clsx(
                'text-[10px] font-medium uppercase tracking-wide',
                done ? 'text-accent' : 'text-ink-soft'
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
