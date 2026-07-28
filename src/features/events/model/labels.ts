// Every place a stored value becomes text or a colour. Nothing else in the
// codebase should own a `switch (style)`.
//
// This existed four times before — in EventCard, EventRow, the permalink page
// and the filter bar — and the copies had already drifted apart, which is how a
// style could read "Social – all styles" on a card and "All styles" one section
// below it. The drift that was intentional survives here as a named option; the
// drift that wasn't is gone.
//
// Words themselves live in the locale bundle (`@/i18n`) as of S3 — this file
// keeps the accessors and, separately, the colour. Colour is locale-invariant
// and raw Tailwind palette classes are lint-banned outside a literal
// `className`, so `chipClass` stays a plain object here rather than moving.

import type { FloorType, Music, Style } from '@/lib/data/types';
import { bundle, DEFAULT_LOCALE, type Locale } from '@/i18n';
import type { SwingEvent } from './event';

const NEUTRAL_CHIP =
  'bg-[var(--surface-container)] text-[var(--on-surface-variant)] border-[var(--surface-container-highest)]';

// Keyed by the `Style` union, so adding a style to the data contract is a type
// error here until it has a colour (and, via `LocaleBundle['styles']`, a label
// in every locale).
const STYLE_CHIP_CLASSES: Record<Style, string> = {
  'lindy-hop': 'bg-[var(--tertiary)]/10 text-[var(--tertiary)] border-[var(--tertiary)]/20',
  balboa: 'bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20',
  blues:
    'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]',
  shag: NEUTRAL_CHIP,
  all: NEUTRAL_CHIP,
};

/**
 * Display name for an event's style. `compact` picks the row list's shorter
 * form, which exists because the chip is `shrink-0` next to a truncating
 * title and the full label pushes the layout.
 */
export function styleLabel(
  style: Style,
  opts?: { compact?: boolean },
  locale: Locale = DEFAULT_LOCALE,
): string {
  const words = bundle(locale).styles[style];
  if (!words) return style;
  return (opts?.compact && words.compact) || words.label;
}

/**
 * Display name for a style chip in the filter panel. For 'all' this means
 * "don't filter", which is a different sentence from "a social that welcomes
 * every style" — hence its own word rather than reusing `styleLabel`.
 */
export function styleFilterLabel(style: Style, locale: Locale = DEFAULT_LOCALE): string {
  const words = bundle(locale).styles[style];
  if (!words) return style;
  return words.filter ?? words.label;
}

/** Chip classes for an event's style. */
export function styleChipClass(style: Style): string {
  return STYLE_CHIP_CLASSES[style] ?? NEUTRAL_CHIP;
}

/**
 * "Beginner friendly" for a plain yes, otherwise the class start time. Both
 * come from the same `beginner_class` column, which holds either 'yes' or HH:MM.
 */
export function beginnerClassLabel(beginnerClass: string, locale: Locale = DEFAULT_LOCALE): string {
  const words = bundle(locale).beginnerClass;
  return beginnerClass.toLowerCase() === 'yes'
    ? words.friendly
    : words.atTime.replace('{time}', beginnerClass);
}

/** Display name for a venue's floor type badge. */
export function floorTypeLabel(floorType: FloorType, locale: Locale = DEFAULT_LOCALE): string {
  return bundle(locale).floors[floorType];
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
