// The small identity chips on an event: style, nights, beginner class, price,
// payment. Each surface composes the ones it wants in the order it wants — the
// card leads with style, the dense row leads with price — which is why these are
// separate one-line components rather than a single `<EventChips>` blob.
//
// Every one of these existed two or three times before, and the copies had
// diverged: the same style read "Social – all styles" on a card and "All styles"
// in the list below it. Words now come from `../model/labels.ts`.

import React from 'react';
import { Banknote, GraduationCap, Moon, Wallet } from 'lucide-react';
import type { Style } from '@/lib/data/types';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locale';
import { beginnerClassLabel, styleChipClass, styleLabel } from '../model/labels';

const CHIP_TYPE = 'rounded text-[10px] font-bold uppercase tracking-wider border';
const CHIP = `inline-flex items-center gap-1 px-2.5 py-0.5 ${CHIP_TYPE}`;

// One entry per surface the style chip appears on. They differ in size and
// positioning, which is easier to notice — and to deliberately unify — when the
// three sit next to each other than when they were three components apart.
const STYLE_CHIP_LAYOUT = {
  /** Card grid: chip in a wrapping row, matched to the other 10px chips. */
  card: `inline-flex items-center px-2.5 py-0.5 ${CHIP_TYPE}`,
  /** Permalink page: a size larger, as the page has room for it. */
  permalink: 'px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border',
  /** Row list: tighter, pushed to the right edge of a single-line row. */
  row: `ml-auto shrink-0 px-2 py-0.5 ${CHIP_TYPE}`,
} as const;

/**
 * The dance style.
 *
 * The `row` layout also takes the compact wording — the chip sits `shrink-0`
 * beside a truncating title, so "Social – all styles" would eat the title.
 */
export function StyleChip({
  style,
  layout,
  locale = DEFAULT_LOCALE,
}: {
  style: Style;
  layout: keyof typeof STYLE_CHIP_LAYOUT;
  locale?: Locale;
}) {
  return (
    <span className={`${STYLE_CHIP_LAYOUT[layout]} ${styleChipClass(style)}`}>
      {styleLabel(style, locale, { compact: layout === 'row' })}
    </span>
  );
}

/** "3 nights" — only shown for a merged multi-night run. */
export function NightsChip({ nightCount }: { nightCount: number }) {
  if (nightCount <= 1) return null;
  return (
    <span
      className={`${CHIP} bg-[var(--info-container)] text-[var(--on-info-container)] border-[var(--on-info-container)]/25 whitespace-nowrap shrink-0`}
    >
      <Moon className="w-3 h-3" />
      {nightCount} nights
    </span>
  );
}

/** "Beginner friendly", or the class start time. One of the three facts the
 *  whole card design exists to surface (see docs/PROJECT.md M1). */
export function BeginnerChip({
  beginnerClass,
  locale = DEFAULT_LOCALE,
}: {
  beginnerClass?: string;
  locale?: Locale;
}) {
  if (!beginnerClass) return null;
  return (
    <span
      className={`${CHIP} bg-[var(--success-container)] text-[var(--on-success-container)] border-[var(--on-success-container)]/25`}
    >
      <GraduationCap className="w-3 h-3" />
      {beginnerClassLabel(beginnerClass, locale)}
    </span>
  );
}

const FACT_CHIP =
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border bg-[var(--surface-container)] text-[var(--on-surface-variant)] border-[var(--surface-container-highest)]';

/** Price and payment as chips — the expanded row's layout. Cards render the same
 *  facts as an icon+text line instead; see `EventFacts`. */
export function PriceChip({ price }: { price?: string }) {
  if (!price) return null;
  return (
    <span className={FACT_CHIP}>
      <Banknote className="w-3.5 h-3.5 shrink-0" />
      {price}
    </span>
  );
}

export function PaymentChip({ payment }: { payment?: string }) {
  if (!payment) return null;
  return (
    <span className={FACT_CHIP}>
      <Wallet className="w-3.5 h-3.5 shrink-0" />
      {payment}
    </span>
  );
}
