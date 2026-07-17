import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, ChevronDown, LogOut } from 'lucide-react';
import { useThemeStore, useResolvedTheme } from '../stores/theme.js';
import { useAuthStore } from '../stores/auth.js';
import { NAV_ITEMS } from './nav.js';

function usePageTitle() {
  const { pathname } = useLocation();
  const item = NAV_ITEMS.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));
  return item?.label ?? 'Dashboard';
}

export default function Topbar() {
  const title = usePageTitle();
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = useResolvedTheme();
  const { admin, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur-sm sm:px-6">
      <h2 className="font-display text-xl font-medium tracking-tight">{title}</h2>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-accent font-display text-xs font-semibold text-accent-ink">
              {(admin?.name ?? 'A').charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:inline">{admin?.name ?? 'Admin'}</span>
            <ChevronDown className="size-4 text-ink-soft" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-44 rounded-xl border border-line bg-surface p-1 shadow-lg/10"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{admin?.name ?? 'Admin'}</p>
                <p className="truncate text-xs text-ink-soft">{admin?.email ?? ''}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-surface-2"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
