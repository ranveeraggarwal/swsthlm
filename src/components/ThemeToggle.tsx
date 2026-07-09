'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

function syncThemeColorMeta(theme: Theme) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#211913' : '#a03b00');
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    const resolved: Theme = current === 'dark' ? 'dark' : 'light';
    setTheme(resolved);
    // The boot script only stamps data-theme; the meta tag is rendered with
    // the light value, so a dark-mode page load needs it corrected here.
    syncThemeColorMeta(resolved);
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // private-mode Safari etc. — theme still applies for this session, just won't persist
    }
    syncThemeColorMeta(next);
    setTheme(next);
  };

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      className="w-10 h-10 rounded flex items-center justify-center transition-colors text-[var(--on-surface-variant)] hover:text-[var(--primary)] cursor-pointer"
      onClick={handleToggle}
      aria-label={label}
    >
      {mounted ? (
        theme === 'dark' ? (
          <Sun className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Moon className="w-5 h-5" aria-hidden="true" />
        )
      ) : (
        <span className="w-5 h-5" />
      )}
    </button>
  );
}
