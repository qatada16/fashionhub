import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { NAV_ITEMS } from './nav.js';

function linkClasses(isActive) {
  return clsx(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent/10 text-accent'
      : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-16 flex-col border-r border-line bg-surface sm:flex lg:w-60">
      <div className="flex h-16 items-center justify-center border-b border-line px-4 lg:justify-start">
        <span className="font-display text-xl font-semibold tracking-tight text-accent">F</span>
        <span className="ml-1 hidden font-display text-xl font-semibold tracking-tight lg:inline">
          ashionHub
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              clsx(linkClasses(isActive), 'justify-center lg:justify-start')
            }
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function BottomBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface sm:hidden"
      aria-label="Main"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          aria-label={label}
          className={({ isActive }) =>
            clsx(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-accent' : 'text-ink-soft'
            )
          }
        >
          <Icon className="size-5" aria-hidden="true" />
        </NavLink>
      ))}
    </nav>
  );
}
