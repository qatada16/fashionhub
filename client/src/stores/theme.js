import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: null,
      toggleTheme: () => {
        const next = (get().theme ?? systemTheme()) === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        applyTheme(next);
      },
    }),
    { name: 'fashionhub-theme' }
  )
);

export function initTheme() {
  applyTheme(useThemeStore.getState().theme ?? systemTheme());
}

export function useResolvedTheme() {
  const theme = useThemeStore((s) => s.theme);
  return theme ?? systemTheme();
}
