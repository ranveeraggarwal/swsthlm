// Every place a stored value becomes English or a colour. Nothing else in the
// codebase should own a `switch (style)`.
//
// This existed four times before — in EventCard, EventRow, the permalink page
// and the filter bar — and the copies had already drifted apart, which is how a
// style could read "Social – all styles" on a card and "All styles" one section
// below it. The drift that was intentional survives here as a named option; the
// drift that wasn't is gone.

import type { Music, Style } from '@/lib/data/types';
import type { SwingEvent } from './event';

interface StylePresentation {
  /** Chip text on a card, row or permalink. */
  label: string;
  /** Shorter form for the dense row list, where the chip is `shrink-0` next to
   *  a truncating title and the full label pushes the layout. Falls back to
   *  `label`. */
  compactLabel?: string;
  /** Chip text in the filter panel. For 'all' this means "don't filter", which
   *  is a different sentence from "a social that welcomes all styles" — hence a
   *  separate string rather than reusing `label`. */
  filterLabel?: string;
  /** Tailwind classes for the chip. Tokens only (see docs/DESIGN.md); the
   *  `local/no-hardcoded-color-classes` lint rule enforces it. */
  chipClass: string;
}

const NEUTRAL_CHIP =
  'bg-[var(--surface-container)] text-[var(--on-surface-variant)] border-[var(--surface-container-highest)]';

// Keyed by the `Style` union, so adding a style to the data contract is a type
// error here until it has a label and a colour.
const STYLES: Record<Style, StylePresentation> = {
  'lindy-hop': {
    label: 'Lindy Hop',
    chipClass: 'bg-[var(--tertiary)]/10 text-[var(--tertiary)] border-[var(--tertiary)]/20',
  },
  balboa: {
    label: 'Balboa',
    chipClass: 'bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20',
  },
  blues: {
    label: 'Blues',
    chipClass:
      'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]',
  },
  shag: {
    label: 'Shag',
    chipClass: NEUTRAL_CHIP,
  },
  all: {
    label: 'Social – all styles',
    compactLabel: 'All styles',
    filterLabel: 'All Styles',
    chipClass: NEUTRAL_CHIP,
  },
};

/** Display name for an event's style. `compact` picks the row list's shorter form. */
export function styleLabel(style: Style, opts?: { compact?: boolean }): string {
  const presentation = STYLES[style];
  if (!presentation) return style;
  return (opts?.compact && presentation.compactLabel) || presentation.label;
}

/** Display name for a style chip in the filter panel. */
export function styleFilterLabel(style: Style): string {
  const presentation = STYLES[style];
  if (!presentation) return style;
  return presentation.filterLabel ?? presentation.label;
}

/** Chip classes for an event's style. */
export function styleChipClass(style: Style): string {
  return STYLES[style]?.chipClass ?? NEUTRAL_CHIP;
}

/**
 * "Beginner friendly" for a plain yes, otherwise the class start time. Both
 * come from the same `beginner_class` column, which holds either 'yes' or HH:MM.
 */
export function beginnerClassLabel(beginnerClass: string): string {
  return beginnerClass.toLowerCase() === 'yes'
    ? 'Beginner friendly'
    : `Beginner class ${beginnerClass}`;
}

/** One line of the who's-playing list: a live act or a DJ, named or not. */
export interface MusicLine {
  type: 'live' | 'dj';
  /** The act's name, when we know it. Absent means "there is live music /
   *  a DJ, we just don't know who" — which is still worth showing. */
  name?: string;
}

/**
 * The performer lines for an event, in the order they're displayed.
 *
 * A named band or DJ always wins. With no names at all we fall back to the
 * `music` column, so a listing still says whether to expect a band or a DJ set;
 * 'mixed' produces both lines. Note that TBA values never reach here — the
 * loader strips them (issue #15), because "DJ: TBA" is noise, not information.
 */
export function musicLines(event: Pick<SwingEvent, 'band' | 'dj' | 'music'>): MusicLine[] {
  const named: MusicLine[] = [];
  if (event.band) named.push({ type: 'live', name: event.band });
  if (event.dj) named.push({ type: 'dj', name: event.dj });
  if (named.length > 0) return named;

  return MUSIC_FALLBACK[event.music] ?? [];
}

const MUSIC_FALLBACK: Record<Music, MusicLine[]> = {
  live: [{ type: 'live' }],
  dj: [{ type: 'dj' }],
  mixed: [{ type: 'live' }, { type: 'dj' }],
};
