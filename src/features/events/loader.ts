// The one door between `/data` and the rest of the app. **Server-only.**
//
// Reads the CSVs (via lib/data/csv.ts, which owns the `node:fs` import), expands
// series + exceptions into dated occurrences, joins each one's venue, and hands
// back `SwingEvent[]`. Everything downstream — the homepage, the permalinks, the
// ICS feed, the JSON-LD — consumes that one type and never touches a CSV.
//
// Three exported readers, differing only in how far back they look. The lookback
// is the interesting part, so each one says why it wants what it wants.

import { cache } from 'react';
import { loadExceptions, loadOneoffs, loadSeries, loadVenues } from '@/lib/data/csv';
import { expandAll } from '@/lib/data/expand';
import type { Occurrence, Venue } from '@/lib/data/types';
import { getStockholmCurrentDate } from '@/lib/date/clock';
import type { SwingEvent } from './model/event';

/** How far ahead weekly series are projected. One-offs beyond it still show. */
const EXPANSION_WEEKS = 10;

/** Keeps a recently-shared permalink alive for a month after the event passes. */
const PERMALINK_LOOKBACK_DAYS = 30;

/**
 * A calendar subscription syncs deletions too: if an event drops out of the feed,
 * the client removes it from the subscriber's calendar. So the feed keeps a year
 * of history — an event someone already danced at stays in their calendar instead
 * of vanishing on the next refresh.
 */
const CALENDAR_LOOKBACK_DAYS = 365;

/**
 * "TBA", "t.b.a" and blank all mean the same thing: we don't know yet. Showing
 * "DJ: TBA" is noise dressed as information (issue #15), so those values are
 * dropped rather than displayed.
 *
 * Applied here, at the boundary, rather than at CSV-read time — an exception row
 * that sets `dj` to TBA is deliberately overriding the series' named DJ with
 * "nobody announced", and stripping it earlier would let the series value show
 * through again.
 */
function withoutTba(value?: string): string | undefined {
  const trimmed = (value ?? '').trim();
  const normalised = trimmed.toLowerCase();
  if (normalised === '' || normalised === 'tba' || normalised === 't.b.a') return undefined;
  return trimmed;
}

/** Join an occurrence with its venue and drop the fields the UI doesn't render. */
function toSwingEvent(occurrence: Occurrence, venues: Map<string, Venue>): SwingEvent {
  const venue = venues.get(occurrence.venueId);

  return {
    id: occurrence.occurrenceId,
    sourceId: occurrence.sourceId,
    sourceType: occurrence.sourceType,

    title: occurrence.name,
    date: occurrence.date,
    start: occurrence.start,
    end: occurrence.end,
    cancelled: occurrence.cancelled,

    // An unresolvable venue id falls back to showing the id itself. Validation
    // makes this unreachable on main; it beats rendering "undefined" if it isn't.
    venue: venue?.name ?? occurrence.venueId,
    address: venue?.address ?? '',
    neighborhood: venue?.neighborhood,
    floorType: venue?.floorType,

    style: occurrence.style,
    music: occurrence.music,
    organizer: occurrence.organizer,
    band: withoutTba(occurrence.band),
    dj: withoutTba(occurrence.dj),
    price: occurrence.price,
    payment: occurrence.payment,
    ticket: occurrence.url,
    body: occurrence.description ?? '',
    beginnerClass: occurrence.beginnerClass,
  };
}

// `cache` dedupes per request/build, so a page that reads events three times
// (metadata, static params, render) parses the CSVs once.
const buildFeed = cache(async (lookbackDays: number): Promise<SwingEvent[]> => {
  const venues = loadVenues();
  const occurrences = expandAll(loadSeries(), loadExceptions(), loadOneoffs(), {
    today: getStockholmCurrentDate(),
    weeks: EXPANSION_WEEKS,
    lookbackDays,
  });

  return occurrences.map((occurrence) => toSwingEvent(occurrence, venues));
});

/** Upcoming events only — the homepage. */
export const getEvents = () => buildFeed(0);

/** Upcoming plus a month of past events — the permalink pages and sitemap. */
export const getPermalinkEvents = () => buildFeed(PERMALINK_LOOKBACK_DAYS);

/** Upcoming plus a year of past events — the ICS subscription feed. */
export const getCalendarEvents = () => buildFeed(CALENDAR_LOOKBACK_DAYS);

// Shared by both the English and Swedish permalink routes (`app/(en)/event/`
// and `app/sv/event/`), which mirror the same set of occurrences — see #260.

/** The route's two segments identify one occurrence; find the one they name. */
export async function findPermalinkEvent(id: string, date: string): Promise<SwingEvent | undefined> {
  const events = await getPermalinkEvents();
  return events.find((event) => event.sourceId === id && event.date === date);
}

/** Every permalink `generateStaticParams` should prerender — identical for both locales. */
export async function permalinkStaticParams(): Promise<{ id: string; date: string }[]> {
  const events = await getPermalinkEvents();
  return events.map((event) => ({ id: event.sourceId, date: event.date }));
}
