// Everything the homepage does to a list of events between loading it and
// rendering it: filtering, faceting, and splitting into sections.
//
// All pure, all takes-its-reference-date-as-an-argument, and all previously
// inlined as `useMemo` blocks inside one 662-line component. Pulling it out here
// is what lets you answer "why is this event in the Coming Up section?" by
// reading forty lines instead of scrolling a component.

import { getMonthKey, isCurrentWeek, isNextWeek, isSunday } from '@/lib/date/calendar';
import type { Style } from '@/lib/data/types';
import { bundle, DEFAULT_LOCALE, type Locale } from '@/i18n';
import type { EventGroup, SwingEvent } from './event';
import { firstNightOf } from './grouping';
import { styleLabel } from './labels';

/** Sentinel meaning "don't filter on style". Also a real style value — see below. */
export const ALL_STYLES = 'all';
/** Sentinel meaning "don't filter on venue". */
export const ALL_VENUES = 'all';

/** Chip text for a venue filter option. */
export function venueFilterLabel(venue: string, locale: Locale = DEFAULT_LOCALE): string {
  return venue === ALL_VENUES ? bundle(locale).filters.allVenues : venue;
}

export interface EventFilters {
  search: string;
  /** A `Style`, or ALL_STYLES for no filter. */
  style: string;
  /** A venue name, or ALL_VENUES for no filter. */
  venue: string;
  liveMusicOnly: boolean;
}

export const NO_FILTERS: EventFilters = {
  search: '',
  style: ALL_STYLES,
  venue: ALL_VENUES,
  liveMusicOnly: false,
};

export function hasActiveFilters(filters: EventFilters): boolean {
  return (
    filters.style !== ALL_STYLES ||
    filters.venue !== ALL_VENUES ||
    filters.liveMusicOnly ||
    filters.search !== ''
  );
}

function matchesSearch(event: SwingEvent, search: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return [event.title, event.venue, event.band, event.dj, event.organizer, event.body].some(
    (field) => field?.toLowerCase().includes(q),
  );
}

/**
 * An event whose own style is 'all' — a social that welcomes every style —
 * matches whichever style you filter for. That is the point of the value.
 */
function matchesStyle(event: SwingEvent, style: string): boolean {
  return style === ALL_STYLES || event.style === ALL_STYLES || event.style === style;
}

function matchesMusic(event: SwingEvent, liveMusicOnly: boolean): boolean {
  return !liveMusicOnly || event.music === 'live' || event.music === 'mixed';
}

/**
 * Apply the filters, and drop anything already in the past.
 *
 * The past-date drop is not a user filter: the event list is baked at build
 * time, so once a calendar day passes without a rebuild that day's occurrences
 * are stale. Today's events may still look "ended" — that's a badge, and useful
 * — but yesterday's must not be on the page at all.
 */
export function filterEvents(
  events: SwingEvent[],
  filters: EventFilters,
  currentDate: string,
): SwingEvent[] {
  return events.filter(
    (event) =>
      event.date >= currentDate &&
      matchesSearch(event, filters.search) &&
      matchesStyle(event, filters.style) &&
      matchesVenue(event, filters.venue) &&
      matchesMusic(event, filters.liveMusicOnly),
  );
}

function matchesVenue(event: SwingEvent, venue: string): boolean {
  return venue === ALL_VENUES || event.venue.trim() === venue;
}

/**
 * The style chips to offer, derived from what's actually listed rather than from
 * the full enum — a filter for a style nobody is running this month is a dead
 * end. ALL_STYLES leads as the "no filter" option, and is skipped as a chip of
 * its own because an 'all' event already matches every other filter.
 */
export function availableStyles(events: SwingEvent[]): Style[] {
  const styles = new Set<Style>();
  for (const event of events) {
    if (event.style !== ALL_STYLES) styles.add(event.style);
  }
  return [ALL_STYLES, ...[...styles].sort()];
}

/** Venue chips, same principle: only venues with something on. */
export function availableVenues(events: SwingEvent[]): string[] {
  const venues = new Set<string>();
  for (const event of events) {
    const venue = event.venue?.trim();
    if (venue && venue.toLowerCase() !== ALL_VENUES) venues.add(venue);
  }
  return [ALL_VENUES, ...[...venues].sort()];
}

/** A day's worth of cards, in the highlighted grid. */
export interface DateSection {
  date: string;
  groups: EventGroup[];
}

/** A month's worth of cards, in the compact list below. */
export interface MonthSection {
  /** "YYYY-MM" — pass through `formatMonthHeading` to display. */
  month: string;
  groups: EventGroup[];
}

export interface EventSections {
  /** Cards for the top grid, grouped by night. */
  highlighted: DateSection[];
  /** Cards for the list below, grouped by month. */
  upcoming: MonthSection[];
  /**
   * True when next week has been pulled up into the highlighted section, which
   * changes its heading from "Happening This Week" to "Coming Up".
   */
  showNextWeek: boolean;
}

/**
 * Split cards into the highlighted grid and the upcoming list.
 *
 * Normally the grid is this week and the list is everything after. On a Sunday,
 * or any time this week has nothing left in it, next week is promoted into the
 * grid instead — a page whose headline section reads "Happening This Week" and
 * is empty is worse than one that looks ahead.
 */
export function buildSections(groups: EventGroup[], currentDate: string): EventSections {
  const thisWeek: EventGroup[] = [];
  const nextWeek: EventGroup[] = [];
  const later: EventGroup[] = [];

  for (const group of groups) {
    const date = firstNightOf(group);
    if (isCurrentWeek(date, currentDate)) thisWeek.push(group);
    else if (isNextWeek(date, currentDate)) nextWeek.push(group);
    else later.push(group);
  }

  const showNextWeek = isSunday(currentDate) || thisWeek.length === 0;

  return {
    highlighted: byDate(showNextWeek ? [...thisWeek, ...nextWeek] : thisWeek),
    upcoming: byMonth(showNextWeek ? later : [...nextWeek, ...later]),
    showNextWeek,
  };
}

/**
 * Group consecutive cards by a key. Input order is preserved, so a date-ascending
 * list produces date-ascending sections without a sort.
 */
function groupConsecutive<T extends string>(
  groups: EventGroup[],
  keyOf: (group: EventGroup) => T,
): { key: T; groups: EventGroup[] }[] {
  const sections: { key: T; groups: EventGroup[] }[] = [];
  for (const group of groups) {
    const key = keyOf(group);
    const current = sections[sections.length - 1];
    if (current && current.key === key) current.groups.push(group);
    else sections.push({ key, groups: [group] });
  }
  return sections;
}

function byDate(groups: EventGroup[]): DateSection[] {
  return groupConsecutive(groups, firstNightOf).map(({ key, groups }) => ({
    date: key,
    groups,
  }));
}

function byMonth(groups: EventGroup[]): MonthSection[] {
  return groupConsecutive(groups, (group) => getMonthKey(firstNightOf(group))).map(
    ({ key, groups }) => ({ month: key, groups }),
  );
}

/**
 * What the count line above the filters says.
 *
 * Two shapes rather than one string because the two cases bold different parts:
 * unfiltered highlights just the number, filtered highlights the whole
 * description.
 */
export type FilterSummary =
  | { kind: 'all'; count: number }
  | { kind: 'filtered'; description: string };

export function summariseFilters(
  filters: EventFilters,
  count: number,
  locale: Locale = DEFAULT_LOCALE,
): FilterSummary {
  if (!hasActiveFilters(filters)) return { kind: 'all', count };
  const words = bundle(locale).filters;

  const qualifiers: string[] = [];
  if (filters.style !== ALL_STYLES) qualifiers.push(styleLabel(filters.style as Style, undefined, locale));
  if (filters.liveMusicOnly) qualifiers.push(words.liveMusicQualifier);

  const noun = count === 1 ? words.eventNoun.one : words.eventNoun.other;
  let description = `${count} ${qualifiers.length > 0 ? `${qualifiers.join(' ')} ` : ''}${noun}`;
  if (filters.venue !== ALL_VENUES) {
    description = words.atVenue.replace('{description}', description).replace('{venue}', filters.venue);
  }
  if (filters.search) {
    description = words.matchingSearch
      .replace('{description}', description)
      .replace('{search}', filters.search);
  }

  return { kind: 'filtered', description };
}

/** Heading for the empty state, which names the filters that emptied the page. */
export function emptyStateHeading(filters: EventFilters, locale: Locale = DEFAULT_LOCALE): string {
  const words = bundle(locale).filters.emptyState;
  const style = filters.style !== ALL_STYLES ? styleLabel(filters.style as Style, undefined, locale) : null;
  const venue = filters.venue !== ALL_VENUES ? filters.venue : null;

  if (style && venue) return words.styleAndVenue.replace('{style}', style).replace('{venue}', venue);
  if (style) return words.style.replace('{style}', style);
  if (venue) return words.venue.replace('{venue}', venue);
  return words.none;
}
