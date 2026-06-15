import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--surface-container-highest)] bg-[var(--surface-container-low)] py-10 text-[var(--on-surface-variant)]/70 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">© {new Date().getFullYear()} Stockholm Swing.</p>
          <p className="mt-1 text-[var(--on-surface-variant)]/70 max-w-sm leading-relaxed">
            Not affiliated with any specific studio. Built to support the local Stockholm swing dance community.
          </p>
        </div>
        <div className="flex gap-6 uppercase font-bold tracking-wider text-[11px] text-[var(--on-surface-variant)]">
          <span>Stockholm, Sweden</span>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSd87pOy31N_3xKthqalT-sDrFB2yoe74Z8HGr8q1HSs6Pis2g/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--primary)] transition-colors"
          >
            Submit an event
          </a>
        </div>
      </div>
    </footer>
  );
}
