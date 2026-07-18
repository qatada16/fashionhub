import { useState } from 'react';
import clsx from 'clsx';
import { formatPrice, formatShortDate } from '../../lib/format.js';

const W = 700;
const H = 220;
const PAD_X = 12;
const PAD_TOP = 40;
const PAD_BOTTOM = 24;

export default function SalesChart({ data }) {
  const [hover, setHover] = useState(null);
  const days = data ?? [];
  const max = Math.max(...days.map((d) => d.total), 1);
  const step = (W - PAD_X * 2) / Math.max(days.length, 1);
  const barW = step * 0.55;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Sales over the last 14 days"
      className="w-full"
      onMouseLeave={() => setHover(null)}
    >
      <line x1={PAD_X} y1={H - PAD_BOTTOM} x2={W - PAD_X} y2={H - PAD_BOTTOM} className="stroke-line" />
      {days.map((d, i) => {
        const h = Math.max((d.total / max) * chartH, d.total > 0 ? 3 : 1.5);
        const x = PAD_X + i * step + (step - barW) / 2;
        const y = H - PAD_BOTTOM - h;
        return (
          <g key={d.date}>
            <rect
              x={PAD_X + i * step}
              y={PAD_TOP}
              width={step}
              height={chartH}
              className="fill-transparent"
              onMouseEnter={() => setHover(i)}
            />
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={3}
              className={clsx(
                'fill-accent transition-opacity pointer-events-none',
                hover === null || hover === i ? 'opacity-100' : 'opacity-40'
              )}
            />
            {i % 2 === 0 && (
              <text
                x={PAD_X + i * step + step / 2}
                y={H - 8}
                textAnchor="middle"
                className="fill-ink-soft text-[10px]"
              >
                {formatShortDate(d.date)}
              </text>
            )}
          </g>
        );
      })}
      {hover !== null && days[hover] && (
        <g
          transform={`translate(${Math.min(
            Math.max(PAD_X + hover * step + step / 2 - 60, PAD_X),
            W - PAD_X - 120
          )}, 4)`}
          className="pointer-events-none"
        >
          <rect width={120} height={34} rx={8} className="fill-surface-2 stroke-line" />
          <text x={60} y={14} textAnchor="middle" className="fill-ink-soft text-[10px]">
            {formatShortDate(days[hover].date)} · {days[hover].count ?? 0} orders
          </text>
          <text x={60} y={28} textAnchor="middle" className="fill-ink text-[11px] font-medium">
            {formatPrice(days[hover].total)}
          </text>
        </g>
      )}
    </svg>
  );
}
