// The one event type the whole UI renders.
//
// `SwingEvent` is an `Occurrence` (see lib/data/types.ts — a concrete dated
// instance produced by series expansion) with its venue joined in. It reuses the
// data layer's enums rather than re-declaring them as loose strings, so a style
// or floor type that isn't in the data contract is a type error rather than a
// mystery blank badge.
//
// It used to widen `style` to `string` and duplicate the FloorType union, with
// an adapter in the loader that renamed 'lindy-hop' to 'lindy' on the way in
// and three components renaming it back to 'Lindy Hop' on the way out. The
// enums now travel unchanged from CSV to screen; display names live in
// `./labels.ts`, which is the only place that turns a value into English.

import type { FloorType, Music, Style } from '@/lib/data/types';
import { SITE_URL } from '@/lib/site';

export interface SwingEvent {
  /** Occurrence id, `${sourceId}:${date}` — unique per event per night. */
  id: string;
  /** The series or one-off id this night came from, without the date suffix. */
  sourceId: string;
  sourceType: 'series' | 'oneoff';

  title: string;
  date: string;  // YYYY-MM-DD
  start: string; // HH:MM, Europe/Stockholm wall clock
  end: string;   // HH:MM; end <= start means the event runs past midnight
  /** True when a series exception or a one-off's status says cancelled. The
   *  event still renders — struck through — because a dancer who planned around
   *  it needs to see that it's off, not find an empty space. */
  cancelled: boolean;

  // Joined from venues.csv.
  venue: string;
  address: string;
  neighborhood?: string;
  floorType?: FloorType;

  style: Style;
  music: Music;
  organizer: string;
  band?: string;
  dj?: string;
  price?: string;
  payment?: string;
  /** The organizer's own page. Labelled "Source" in the UI. */
  ticket?: string;
  /** Free prose from the organizer. Displayed, never trusted — every fact worth
   *  relying on has its own field (CLAUDE.md principle 1). */
  body: string;
  /** 'yes', or a HH:MM class start time. */
  beginnerClass?: string;
}

/**
 * One card's worth of event: a single night, or a run of consecutive nights of
 * the same one-off collapsed together.
 *
 * The expansion layer emits one occurrence per night — correct for the ICS feed,
 * where each night is its own VEVENT — and `./grouping.ts` folds the runs back
 * up for display. Single-night groups are the common case and render identically
 * to a plain event.
 *
 * (This was called `EventCard`, which collided with the component of the same
 * name and forced `import { EventCard as EventCardType }` at the call site.)
 */
export interface EventGroup {
  /** First night. All card-face data comes from here. */
  event: SwingEvent;
  /** Every night in this run, ascending. */
  dates: string[];
  /** `dates.length`, named for what it means on the badge: "3 nights". */
  nightCount: number;
}

/** Site-relative permalink for an occurrence: `/event/${sourceId}/${date}`. */
export function eventPath(event: SwingEvent): string {
  return `/event/${event.sourceId}/${event.date}`;
}

/** Absolute permalink. Always on the canonical host — these end up in shared
 *  links, ICS descriptions and JSON-LD, which must not point at a preview deploy. */
export function eventUrl(event: SwingEvent): string {
  return `${SITE_URL}${eventPath(event)}`;
}

/** A Google Maps search for the venue. Used by every surface that shows one. */
export function venueMapsUrl(event: SwingEvent): string {
  const query = `${event.venue} ${event.address}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Sanitise an occurrence id for use as an HTML id / IDREF. Occurrence ids
 * contain a colon, which is legal in an id attribute but awkward in selectors.
 */
export function domIdFor(event: SwingEvent, prefix: string): string {
  return `${prefix}-${event.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}
