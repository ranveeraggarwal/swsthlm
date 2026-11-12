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

import type { Danceability, Music, Style } from '@/lib/data/types';
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
  'rock-n-roll': NEUTRAL_CHIP,
  all: NEUTRAL_CHIP,
};

const STYLE_EYEBROW_CLASSES: Record<Style, string> = {
  'lindy-hop': 'text-[var(--tertiary)]',
  balboa: 'text-[var(--secondary)]',
  blues: 'text-[var(--on-surface-variant)]',
  shag: 'text-[var(--on-surface-variant)]',
  'rock-n-roll': 'text-[var(--on-surface-variant)]',
  all: 'text-[var(--on-surface-variant)]',
};

export interface DanceabilityTone {
  textClass: string;
  barClass: string;
  chipClass: string;
}

const HIGH_DANCEABILITY_TONE: DanceabilityTone = {
  textClass: 'text-[var(--on-success-container)]',
  barClass: 'bg-[var(--on-success-container)]',
  chipClass:
    'bg-[var(--success-container)] text-[var(--on-success-container)] border-[var(--on-success-container)]/25',
};

const MID_DANCEABILITY_TONE: DanceabilityTone = {
  textClass: 'text-[var(--tertiary)]',
  barClass: 'bg-[var(--tertiary)]',
  chipClass: 'bg-[var(--tertiary)]/10 text-[var(--tertiary)] border-[var(--tertiary)]/25',
};

const LOW_DANCEABILITY_TONE: DanceabilityTone = {
  textClass: 'text-[var(--on-caution-container)]',
  barClass: 'bg-[var(--on-caution-container)]',
  chipClass:
    'bg-[var(--caution-container)] text-[var(--on-caution-container)] border-[var(--on-caution-container)]/25',
};

const DANCEABILITY_TONES: Record<Danceability, DanceabilityTone> = {
  5: HIGH_DANCEABILITY_TONE,
  4: HIGH_DANCEABILITY_TONE,
  3: MID_DANCEABILITY_TONE,
  2: LOW_DANCEABILITY_TONE,
  1: LOW_DANCEABILITY_TONE,
};

/**
 * Display name for an event's style. `compact` picks the row list's and card
 * eyebrow's shorter form ("All styles" instead of "Social – all styles").
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

/** Tracked text colour for an event's style in the Playbill eyebrow. */
export function styleEyebrowClass(style: Style): string {
  return STYLE_EYEBROW_CLASSES[style] ?? 'text-[var(--on-surface-variant)]';
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

/** Concise Playbill eyebrow callout for `beginner_class` ("Intro 19:00" or "Beginner friendly"). */
export function beginnerEyebrowLabel(
  beginnerClass: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const words = bundle(locale).beginnerClass;
  return beginnerClass.toLowerCase() === 'yes'
    ? words.friendly
    : words.eyebrowAtTime.replace('{time}', beginnerClass);
}

/** "Taster class {time}" — the standalone class before a one-off's main event.
 *  Unlike `beginnerClassLabel` there's no bare "friendly" form: a taster is
 *  always at a specific time (see `docs/DATA.md` `taster_class`). */
export function tasterClassLabel(tasterClass: string, locale: Locale = DEFAULT_LOCALE): string {
  return bundle(locale).tasterClass.atTime.replace('{time}', tasterClass);
}

/** Concise Playbill eyebrow callout for `taster_class` ("Taster 18:30"). */
export function tasterEyebrowLabel(tasterClass: string, locale: Locale = DEFAULT_LOCALE): string {
  return bundle(locale).tasterClass.eyebrowAtTime.replace('{time}', tasterClass);
}

/** Fixed one-line description for a venue's 1–5 danceability score. */
export function danceabilityLabel(
  score: Danceability,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return bundle(locale).danceability.levels[score];
}

/** Semantic ink, segment fill, and chip classes for a 1–5 danceability score. */
export function danceabilityTone(score: Danceability): DanceabilityTone {
  return DANCEABILITY_TONES[score];
}

/** True when a free-form `price` string starts with "Free", "Gratis", or "Fri entré". */
export function isFreePrice(price?: string): boolean {
  if (!price) return false;
  return /^(free|gratis|fri entr[eé])(?=$|[\s.,;:()/–—-])/i.test(price.trim());
}

/** Editorial dateline phrasing for `price` and `payment` (e.g. "50/100 kr (Swish)"). */
export function formatPriceLine(price?: string, payment?: string): string | undefined {
  if (price && payment) {
    return price.includes('(') ? `${price} · ${payment}` : `${price} (${payment})`;
  }
  return price || payment || undefined;
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

/** The event card header's badge: "Live band", "DJ set", or both for `mixed`. */
export function musicBadgeLabel(music: Music, locale: Locale = DEFAULT_LOCALE): string {
  return bundle(locale).musicBadge[music];
}

export interface RecordLabelTone {
  fillClass: string;
  strokeClass: string;
  textFillClass: string;
}

const PRIMARY_RECORD_LABEL: RecordLabelTone = {
  fillClass: 'fill-[var(--primary)]',
  strokeClass: 'stroke-[var(--on-primary)]',
  textFillClass: 'fill-[var(--on-primary)]',
};

// Keyed by `Style` so a DJ card's 78 center label echoes the night's dance
// family (brass for Lindy, navy for Balboa, sunset otherwise), using paired
// `--on-*` ink tokens so the micro-print stays legible in dark mode too.
const RECORD_LABEL_TONES: Record<Style, RecordLabelTone> = {
  'lindy-hop': {
    fillClass: 'fill-[var(--tertiary)]',
    strokeClass: 'stroke-[var(--on-tertiary)]',
    textFillClass: 'fill-[var(--on-tertiary)]',
  },
  balboa: {
    fillClass: 'fill-[var(--secondary)]',
    strokeClass: 'stroke-[var(--on-secondary)]',
    textFillClass: 'fill-[var(--on-secondary)]',
  },
  blues: PRIMARY_RECORD_LABEL,
  shag: PRIMARY_RECORD_LABEL,
  'rock-n-roll': PRIMARY_RECORD_LABEL,
  all: PRIMARY_RECORD_LABEL,
};

/** Disc center-label fill and micro-print ink classes for a 78-rpm sleeve header. */
export function recordLabelTone(style: Style): RecordLabelTone {
  return RECORD_LABEL_TONES[style];
}

/**
 * Small, deterministic non-negative integer from a string — identical on the
 * server and in the browser so decorative print variations never trip hydration.
 */
export function hashOf(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

const LIFT_TILTS = [-0.75, -0.5, 0.5, 0.75] as const;

/** Subtle hand-dealt slant (degrees) applied when an active card is lifted. */
export function cardLiftTilt(id: string): number {
  return LIFT_TILTS[hashOf(id) % LIFT_TILTS.length];
}
