'use client';

// "Find your rhythm" — the four dances, set as an editorial index rather than
// four cards: newspaper columns, each under a rule and a record label in the
// dance's own accent colour.
//
// The facts are the data's: the count is nights in the calendar given over to
// that dance (`dedicatedNights`), and the button applies the listing's real
// style filter. The short introductions are copy, in the locale bundle.

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Style } from '@/lib/data/types';
import { useLocale } from '@/components/providers/LocaleProvider';
import { FEATURED_STYLES, type FeaturedStyle } from '../model/highlights';
import { styleAccentClass, styleLabel } from '../model/labels';
import { SectionHeading } from './SectionHeading';

interface DanceStylesProps {
  counts: Record<FeaturedStyle, number>;
  number: number;
  onSelectStyle: (style: Style) => void;
}

export function DanceStyles({ counts, number, onSelectStyle }: DanceStylesProps) {
  const { locale, bundle } = useLocale();
  const t = bundle.danceStyles;

  return (
    <section aria-labelledby="styles-heading">
      <SectionHeading
        id="styles-heading"
        number={number}
        kicker={bundle.listing.kickers.styles}
        lead={t.heading.lead}
        em={t.heading.em}
        standfirst={t.standfirst}
      />

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 xl:gap-x-10 gap-y-10 sm:gap-y-12">
        {FEATURED_STYLES.map((style, idx) => {
          const entry = t.entries[style];
          const name = styleLabel(style, undefined, locale);
          const count = counts[style];
          return (
            <li
              key={style}
              className={`flex flex-col border-t-4 border-current pt-5 ${styleAccentClass(style)}`}
            >
              {/* Label beside the name on a phone, above it once columns form. */}
              <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-5">
                <RecordLabel side={`A${idx + 1}`} initial={name.charAt(0)} />
                <h3 className="font-serif text-2xl lg:text-[1.75rem] font-bold tracking-tight text-[var(--on-surface)]">
                  {name}
                </h3>
              </div>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--on-surface-variant)] leading-relaxed">
                {entry.origin}
                <br />
                {t.tempo}: <span className="text-current font-semibold">{entry.tempo}</span>
              </p>
              <p className="mt-3 font-sans text-sm leading-relaxed text-[var(--on-surface-variant)] flex-1">
                {entry.description}
              </p>
              {/* Fixed height, so the dashed rules line up across columns
                  whether or not a dance has a button under its count. */}
              <div className="mt-4 pt-3 border-t border-dashed border-current sm:min-h-[4.75rem]">
                <p className="font-mono text-[11px] leading-relaxed text-[var(--on-surface-variant)]">
                  {count > 0
                    ? (count === 1 ? t.dedicated.one : t.dedicated.other).replace('{count}', String(count))
                    : t.none}
                </p>
                {count > 0 && (
                  <button
                    type="button"
                    onClick={() => onSelectStyle(style)}
                    className="mt-2 inline-flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-wider text-[var(--primary)] hover:underline underline-offset-4 cursor-pointer"
                  >
                    {t.show.replace('{style}', name)}
                    <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * A small 78 label in the dance's accent (`currentColor`): grooved rim, the
 * dance's initial in Playfair italic, and a side/track number in mono.
 * Decorative — the heading beside it names the dance.
 */
function RecordLabel({ side, initial }: { side: string; initial: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 80 80" className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
      <circle cx="40" cy="40" r="39" className="fill-[var(--border-ink)]" />
      <g className="fill-none stroke-[var(--outline)]" strokeOpacity={0.45} strokeWidth={0.7}>
        <circle cx="40" cy="40" r="34" />
        <circle cx="40" cy="40" r="29" />
      </g>
      <circle cx="40" cy="40" r="22" className="fill-current" />
      <text
        x="40"
        y="46"
        textAnchor="middle"
        className="fill-[var(--surface-container-lowest)] font-serif italic"
        fontSize={19}
        fontWeight={700}
      >
        {initial}
      </text>
      <text
        x="40"
        y="56"
        textAnchor="middle"
        className="fill-[var(--surface-container-lowest)] font-mono"
        fontSize={5.5}
        letterSpacing={0.8}
      >
        {side}
      </text>
    </svg>
  );
}
