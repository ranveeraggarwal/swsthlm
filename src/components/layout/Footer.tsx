'use client';

// The colophon: the masthead set once more, the tagline, and the links a
// visitor looks for at the bottom of a page — the About page, the calendar
// feed, where organizers send events, and the community on GitHub.

import React from 'react';
import Link from 'next/link';
import { GitHubIcon } from '@/components/ui/GitHubIcon';
import { CALENDAR_WEBCAL_URL, CONTACT_EMAIL, GITHUB_DISCUSSIONS_URL } from '@/lib/site';
import { FreshnessSignal } from './FreshnessSignal';
import { useLocale } from '@/components/providers/LocaleProvider';

const LINK =
  'font-mono text-xs uppercase tracking-[0.14em] text-[var(--on-surface)] hover:text-[var(--primary)] underline-offset-4 hover:underline transition-colors';

export function Footer() {
  const { bundle } = useLocale();
  return (
    <footer className="w-full mt-16 lg:mt-24 border-t-2 border-[var(--border-ink)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-end">
        <div>
          <p className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-[var(--on-surface)]">
            Stockholm <span className="italic font-normal text-[var(--primary)]">Swing</span>
          </p>
          <p className="mt-3 max-w-md font-serif italic text-lg leading-snug text-[var(--on-surface-variant)]">
            {bundle.footer.tagline}
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="grid gap-3 md:justify-items-end">
            <li>
              <Link href="/about" className={LINK}>
                {bundle.nav.about}
              </Link>
            </li>
            <li>
              <a href={CALENDAR_WEBCAL_URL} className={LINK}>
                {bundle.footer.subscribe}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
                {bundle.footer.addEvent}
              </a>
            </li>
            <li>
              <a
                href={GITHUB_DISCUSSIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${LINK} inline-flex items-center gap-2`}
              >
                <GitHubIcon className="w-3.5 h-3.5" aria-hidden="true" />
                {bundle.footer.sourceCode}
                <span className="sr-only">{bundle.card.opensInNewTab}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-[var(--surface-container-highest)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.12em]">
          <p>© {new Date().getFullYear()} Stockholm Swing</p>
          <FreshnessSignal />
        </div>
      </div>
    </footer>
  );
}
