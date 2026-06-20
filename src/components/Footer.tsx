import React from 'react';
import { FreshnessSignal } from './FreshnessSignal';

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--surface-container-highest)] bg-[var(--surface-container-low)] py-10 text-[var(--on-surface-variant)]/70 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <p className="font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">© {new Date().getFullYear()} Stockholm Swing.</p>
          <p className="mt-1 text-[var(--on-surface-variant)]/70 max-w-sm leading-relaxed">
            Not affiliated with any specific studio. Built to support the local Stockholm swing dance community.
          </p>
        </div>
        <div className="flex flex-col items-center sm:items-end gap-1 uppercase font-bold tracking-wider text-[11px] text-[var(--on-surface-variant)]">
          <span>Stockholm, Sweden</span>
          <FreshnessSignal />
        </div>
      </div>
    </footer>
  );
}
