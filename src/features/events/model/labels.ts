// Every place a stored value becomes words or a colour. Nothing else in the
// codebase should own a `switch (style)`.
//
// This existed four times before — in EventCard, EventRow, the permalink page
// and the filter bar — and the copies had already drifted apart, which is how a
// style could read "Social – all styles" on a card and "All styles" one section
// below it. The drift that was intentional survives here as a named option; the
// drift that wasn't is gone.
//
// The tables are keyed twice over: by the value's union (`Style`, `FloorType`)
// and by `Locale`. Both dimensions are exhaustive, so a new style in the data
// contract *and* a new site locale are each a compile error until every table
// has text for them. That is why these strings stay here rather than moving to
// the chrome dictionary in `lib/i18n/` — a global `Record<string, string>`
// would silently accept a style it had never heard of and render a blank chip
// (see issue #262).

import type { FloorType, Music, Style } from '@/lib/data/types';
import type { Locale } from '@/lib/i18n/locale';
import type { SwingEvent } from './event';

/** The wording of a style, per locale. */
interface StyleText {
  /** Chip text on a card, row or permalink. */
  label: string;
  /** Shorter form for the dense row list, where the chip is `shrink-0` next to
   *  a truncating title and the full label pushes the layout. Falls back to
   *  `label`. */
  compactLabel?: string;
  /** Chip text in the filter panel. For 'all' this means "don't filter", which
   *  is a different sentence from "a social that welcomes all styles" — hence a
   *  separate string rather than reusing `label`. The distinction is real in
   *  Swedish too: "Alla stilar" vs "Socialdans – alla stilar". */
  filterLabel?: string;
}

interface StylePresentation {
  /** Tailwind classes for the chip. Tokens only (see docs/DESIGN.md); the
   *  `local/no-hardcoded-color-classes` lint rule enforces it. Locale-invariant
   *  — a colour doesn't translate, and keeping it outside `text` is what stops
   *  the two locales' palettes drifting apart. */
  chipClass: string;
  text: Record<Locale, StyleText>;
}

const NEUTRAL_CHIP =
  'bg-[var(--surface-container)] text-[var(--on-surface-variant)] border-[var(--surface-container-highest)]';

// The four dance styles keep their names in Swedish: "Lindy Hop", "Balboa",
// "Shag" and "Blues" are what Swedish dancers call them, so the en/sv entries
// are deliberately identical rather than accidentally untranslated.
const STYLES: Record<Style, StylePresentation> = {
  'lindy-hop': {
    chipClass: 'bg-[var(--tertiary)]/10 text-[var(--tertiary)] border-[var(--tertiary)]/20',
    text: {
      en: { label: 'Lindy Hop' },
      sv: { label: 'Lindy Hop' },
    },
  },
  balboa: {
    chipClass: 'bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20',
    text: {
      en: { label: 'Balboa' },
      sv: { label: 'Balboa' },
    },
  },
  blues: {
    chipClass:
      'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]',
    text: {
      en: { label: 'Blues' },
      sv: { label: 'Blues' },
    },
  },
  shag: {
    chipClass: NEUTRAL_CHIP,
    text: {
      en: { label: 'Shag' },
      sv: { label: 'Shag' },
    },
  },
  all: {
    chipClass: NEUTRAL_CHIP,
    text: {
      en: {
        label: 'Social – all styles',
        compactLabel: 'All styles',
        filterLabel: 'All Styles',
      },
      // "socialdans" is the word the organizers already use in the data.
      sv: {
        label: 'Socialdans – alla stilar',
        compactLabel: 'Alla stilar',
        filterLabel: 'Alla stilar',
      },
    },
  },
};

/** Display name for an event's style. `compact` picks the row list's shorter form. */
export function styleLabel(style: Style, locale: Locale, opts?: { compact?: boolean }): string {
  const text = STYLES[style]?.text[locale];
  if (!text) return style;
  return (opts?.compact && text.compactLabel) || text.label;
}

/** Display name for a style chip in the filter panel. */
export function styleFilterLabel(style: Style, locale: Locale): string {
  const text = STYLES[style]?.text[locale];
  if (!text) return style;
  return text.filterLabel ?? text.label;
}

/** Chip classes for an event's style. */
export function styleChipClass(style: Style): string {
  return STYLES[style]?.chipClass ?? NEUTRAL_CHIP;
}

const BEGINNER_CLASS: Record<Locale, { friendly: string; atTime: (time: string) => string }> = {
  en: { friendly: 'Beginner friendly', atTime: (time) => `Beginner class ${time}` },
  sv: { friendly: 'Nybörjarvänlig', atTime: (time) => `Nybörjarkurs ${time}` },
};

/**
 * "Beginner friendly" for a plain yes, otherwise the class start time. Both
 * come from the same `beginner_class` column, which holds either 'yes' or HH:MM.
 */
export function beginnerClassLabel(beginnerClass: string, locale: Locale): string {
  const text = BEGINNER_CLASS[locale];
  return beginnerClass.toLowerCase() === 'yes'
    ? text.friendly
    : text.atTime(beginnerClass);
}

// What kind of room the dancing happens in. The icons stay with the badge
// component; only the words live here, per the rule above. `hall` covers a
// community hall, theater or ballroom (see docs/DATA.md) — "Danssal" carries
// the same "big room set up for dancing" sense in Swedish.
const FLOOR_TYPES: Record<FloorType, Record<Locale, string>> = {
  studio: { en: 'Dance studio', sv: 'Dansstudio' },
  hall: { en: 'Dance hall', sv: 'Danssal' },
  bar: { en: 'Bar / restaurant', sv: 'Bar / restaurang' },
  outdoor: { en: 'Outdoor', sv: 'Utomhus' },
};

/** Display name for a venue's floor type. */
export function floorTypeLabel(floorType: FloorType, locale: Locale): string {
  return FLOOR_TYPES[floorType]?.[locale] ?? floorType;
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
