'use client';

import React from 'react';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { GITHUB_DISCUSSIONS_URL } from '@/lib/site';
import { FreshnessSignal } from './FreshnessSignal';
import { useLocale } from '@/components/providers/LocaleProvider';

export function Footer() {
  const { bundle } = useLocale();
  return (
    <footer className="w-full border-t border-[var(--surface-container-highest)] bg-[var(--surface-container-low)] py-10 text-[var(--on-surface-variant)]/70 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <p className="font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">© {new Date().getFullYear()} Stockholm Swing.</p>
          <p className="mt-1 text-[var(--on-surface-variant)] max-w-sm leading-relaxed">
            {bundle.footer.tagline}
          </p>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-3">
          <div className="flex items-center gap-2">
            <a
              href={GITHUB_DISCUSSIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={bundle.footer.github}
              title={bundle.footer.github}
              className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
            >
              <GitHubIcon className="w-4 h-4" />
            </a>
          </div>
          <FreshnessSignal />
        </div>
      </div>
    </footer>
  );
}
