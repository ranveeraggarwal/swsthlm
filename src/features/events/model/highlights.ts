// The homepage's two editorial sections — "The music never stops" and "Find
// your rhythm" — derived from the same `SwingEvent[]` the listing renders.
//
// Nothing here is written by hand: the bandstand is the listing's own `band`
// column, the figures are counts of its `music` column, and a style's
// "dedicated nights" are rows whose `style` is that dance. If the data can't
// say it, these sections don't (CLAUDE.md principle 1).
//
// Pure, and takes "now" as an argument like everything else in `model/`, so
// the sections agree with the listing beside them about what's still ahead.

import type { Now } from '@/lib/date/clock';
import type { Style } from '@/lib/data/types';
import type { SwingEvent } from './event';
import { getTemporalBadge, isPastEvent } from './temporal';

/** Still ahead: not dropped from the listing, not already over tonight, not
 *  called off. A cancelled night is listed (struck through) but nobody is on
 *  the bandstand for it, so it doesn't count here. */
function isStillAhead(event: SwingEvent, now: Now): boolean {
  return (
    !event.cancelled &&
    !isPastEvent(event, now) &&
    getTemporalBadge(event, now, false) !== 'ended'
  );
}

const hasLiveMusic = (event: SwingEvent) => event.music === 'live' || event.music === 'mixed';
const hasDj = (event: SwingEvent) => event.music === 'dj' || event.music === 'mixed';
const bandOf = (event: SwingEvent) => event.band?.trim() ?? '';

/** One line of the bandstand: a band, its next night, and how many more. */
export interface BandstandEntry {
  band: string;
  /** The band's next night in the listing. */
  event: SwingEvent;
  /** Further nights by the same band after `event`. */
  moreNights: number;
}

/**
 * The next named bands to play, one line per band, in the order they next
 * take the stage. A band with a weekly residency appears once, at its next
 * night, rather than filling the list on its own.
 *
 * Bands are matched on their trimmed, case-folded name — the same act typed
 * "The Django Quartet" and "the Django Quartet" by two organizers is one act.
 */
export function bandstand(events: SwingEvent[], now: Now, limit = 6): BandstandEntry[] {
  const byBand = new Map<string, BandstandEntry>();

  for (const event of events) {
    if (!hasLiveMusic(event) || !isStillAhead(event, now)) continue;
    const band = bandOf(event);
    if (!band) continue;

    const key = band.toLowerCase();
    const entry = byBand.get(key);
    if (entry) entry.moreNights += 1;
    else byBand.set(key, { band, event, moreNights: 0 });
  }

  // Map iteration is insertion order, and `events` arrives date-ascending
  // from `expandAll`, so this is already "next to play first".
  return [...byBand.values()].slice(0, limit);
}

export interface MusicStats {
  /** Nights with a band (live or mixed). */
  liveNights: number;
  /** Distinct named bands across those nights. */
  bands: number;
  /** Nights with a DJ (dj or mixed). */
  djNights: number;
}

/** Side B's figures: what's in the calendar, counted by kind of music. */
export function musicStats(events: SwingEvent[], now: Now): MusicStats {
  let liveNights = 0;
  let djNights = 0;
  const bands = new Set<string>();

  for (const event of events) {
    if (!isStillAhead(event, now)) continue;
    if (hasLiveMusic(event)) {
      liveNights += 1;
      const band = bandOf(event);
      if (band) bands.add(band.toLowerCase());
    }
    if (hasDj(event)) djNights += 1;
  }

  return { liveNights, bands: bands.size, djNights };
}

/**
 * The four dances "Find your rhythm" introduces, in the order it introduces
 * them. A subset of `Style`: 'all' isn't a dance, and rock'n'roll is a
 * swing-adjacent neighbour the calendar lists rather than one it presents.
 */
export const FEATURED_STYLES = ['lindy-hop', 'balboa', 'shag', 'blues'] as const satisfies readonly Style[];
export type FeaturedStyle = (typeof FEATURED_STYLES)[number];

function isFeaturedStyle(style: Style): style is FeaturedStyle {
  return (FEATURED_STYLES as readonly Style[]).includes(style);
}

/**
 * Nights given over to one dance, per featured style. Deliberately *not* what
 * the style filter returns: that also includes every all-styles social, which
 * would give each dance the same large number and say nothing.
 */
export function dedicatedNights(events: SwingEvent[], now: Now): Record<FeaturedStyle, number> {
  const counts: Record<FeaturedStyle, number> = { 'lindy-hop': 0, balboa: 0, shag: 0, blues: 0 };
  for (const event of events) {
    if (!isStillAhead(event, now)) continue;
    if (isFeaturedStyle(event.style)) counts[event.style] += 1;
  }
  return counts;
}
