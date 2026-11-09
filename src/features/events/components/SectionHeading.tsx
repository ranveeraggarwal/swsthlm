'use client';

// The homepage's section heading, set like a magazine department: a heavy
// rule, a numbered kicker in the mono face ("No. 01 — This week"), then the
// headline in Playfair with its syncopated italic.
//
// One component for every homepage section so the numbering, the type scale
// and the rule stay in step — the listing's two sections and the two
// editorial ones alike. `tone="sleeve"` re-inks it for the bandstand's dark
// record sleeve.

import React from 'react';

interface SectionHeadingProps {
  /** Position on the page, 1-based. Assigned by `EventCalendar` in render
   *  order, so hiding a section doesn't leave a gap in the numbering. */
  number: number;
  kicker: string;
  lead: string;
  em: string;
  /** The `h2`'s id, for the section's `aria-labelledby`. */
  id: string;
  standfirst?: string;
  tone?: 'page' | 'sleeve';
}

export function SectionHeading({
  number,
  kicker,
  lead,
  em,
  id,
  standfirst,
  tone = 'page',
}: SectionHeadingProps) {
  const onSleeve = tone === 'sleeve';
  return (
    <header
      className={`mb-8 lg:mb-10 ${
        onSleeve ? '' : 'border-t-2 border-[var(--border-ink)] pt-5'
      } lg:flex lg:items-end lg:justify-between lg:gap-12`}
    >
      <div>
        <p
          className={`flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${
            onSleeve ? 'text-[var(--sleeve-accent)]' : 'text-[var(--primary)]'
          }`}
        >
          <span>No. {String(number).padStart(2, '0')}</span>
          <span aria-hidden="true" className="h-px w-8 bg-current" />
          <span>{kicker}</span>
        </p>
        <h2
          id={id}
          className={`mt-3 font-serif font-black tracking-tight leading-[1.05] text-[1.875rem] sm:text-4xl lg:text-[2.75rem] ${
            onSleeve ? 'text-[var(--on-sleeve)]' : 'text-[var(--on-surface)]'
          }`}
        >
          {lead}
          <span className="italic font-normal">{em}</span>
        </h2>
      </div>
      {standfirst && (
        <p
          className={`mt-3 lg:mt-0 max-w-md font-sans text-sm sm:text-base leading-relaxed ${
            onSleeve ? 'text-[var(--on-sleeve-variant)]' : 'text-[var(--on-surface-variant)]'
          }`}
        >
          {standfirst}
        </p>
      )}
    </header>
  );
}
