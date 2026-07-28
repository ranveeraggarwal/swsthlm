// The contract: every string a human translates lives on this type, in
// exactly one place. `en.ts` and `sv.ts` each `satisfies LocaleBundle`, so a
// key that's missing or misspelled in either file is a compile error — the
// same enforcement `features/events/model/labels.ts` gets from
// `Record<Style, StylePresentation>`, no lint rule or script involved.
//
// S3 moved the domain vocabulary in: `styles`, `music`, `floors` and
// `temporal` below are keyed by the data contract's own unions
// (`lib/data/types.ts`), so a style or floor type added there is a compile
// error here until it has a word in both `en.ts` and `sv.ts`.

import type { FloorType, Music, Style } from '@/lib/data/types';

/** Weekday names indexed by `Date.getUTCDay()`, so Sunday is 0. The tuple
 *  length is part of the contract — a locale file with six weekdays is a
 *  compile error, not an `undefined` in the middle of a date string. */
type Weekdays = readonly [string, string, string, string, string, string, string];

/** Month names indexed by `Date.getUTCMonth()`. Twelve, for the same reason. */
type Months = readonly [
  string, string, string, string, string, string,
  string, string, string, string, string, string,
];

/** The two forms every unit needs in English and Swedish alike. A locale
 *  with more plural categories is a change to this type, not to a component. */
interface PluralForms {
  one: string;
  other: string;
}

export interface LocaleBundle {
  /** The header: the two primary links plus the mobile menu toggle's label
   *  (used as both `aria-label` and the hover `title`, per Header.tsx). */
  nav: {
    calendar: string;
    about: string;
    openMenu: string;
    closeMenu: string;
  };
  /** Strings for assistive tech that aren't part of the visible chrome above. */
  a11y: {
    skipToContent: string;
  };
  /** The footer's "when was this last updated" line. */
  freshness: {
    /** `{time}` is filled from `relativeTime` below. */
    updated: string;
  };
  // Date formatting is templates plus word lists, never `Intl`. Two bugs have
  // shipped from trusting `toLocaleDateString`: #160 (a date-only string is
  // UTC midnight, so formatting without `timeZone: 'UTC'` rolls the day back
  // west of Greenwich) and #200 (Node's ICU and Chromium's ICU disagreed on
  // punctuation for the identical call, hydration error #418 on every load).
  // A third pair was found writing this block — see `eventDateShort` and
  // `rangeDay`.
  //
  // Templates take `{weekdayShort} {weekdayLong} {day} {monthShort}
  // {monthLong} {year}`. They exist because word order is not a translation:
  // English says "Wednesday, Jun 3", Swedish says "onsdag 3 juni".
  dates: {
    weekdaysShort: Weekdays;
    weekdaysLong: Weekdays;
    monthsShort: Months;
    monthsLong: Months;
    /** The dense row list's date column: "Wed 26 Aug" / "ons 26 aug". */
    compactWeekdayDate: string;
    /** Date-section headings and the permalink: "Wednesday, Jun 3" / "onsdag 3 juni". */
    eventDate: string;
    /** A card's date line: "Wed 24 Jun" / "ons 24 jun". */
    eventDateShort: string;
    /** Month headings: "August 2026" / "augusti 2026". */
    monthHeading: string;
    /** One end of a multi-night run: "Fri 28" / "fre 28". */
    rangeDay: string;
    /** Joins the two ends of a run. */
    rangeSeparator: string;
  };
  /** "Schedule updated 3 minutes ago" / "Schemat uppdaterat för 3 minuter sedan".
   *  `pattern` wraps the count and unit, which is why Swedish's circumfixed
   *  "för … sedan" needs no special case. */
  relativeTime: {
    justNow: string;
    /** Takes `{count}` and `{unit}`. */
    pattern: string;
    units: {
      minute: PluralForms;
      hour: PluralForms;
      day: PluralForms;
      week: PluralForms;
    };
  };
  // Domain vocabulary — S3. Dance style *names* ('Lindy Hop', 'Balboa', 'Shag',
  // 'Blues') are deliberately not here: they're what Swedish dancers call them
  // too, so the union's own keys already double as their Swedish label. Only
  // the sentences built around a style go through this table.
  /** `compact` is the dense row list's shorter form (falls back to `label`);
   *  `filter` is the filter panel's word (falls back to `label`). For 'all'
   *  these read differently on purpose: `label` is "a social that welcomes
   *  every style", `filter` is "don't filter" — see `labels.ts`. */
  styles: Record<Style, { label: string; compact?: string; filter?: string }>;
  /** The `music` column, spelled out. `mixed` never displays on its own —
   *  `musicLines` in `labels.ts` splits it into a live line and a DJ line —
   *  but the table stays `Record<Music, …>` so it can't drift from the data
   *  contract if a third music value is ever added. */
  music: Record<Music, string>;
  /** The venue's floor type badge. */
  floors: Record<FloorType, string>;
  /** The event-card badge's word. Colour, priority and layout stay in
   *  `features/events/model/temporal.ts` / `TemporalBadgeDisplay.tsx`; only
   *  the text moves here. Keys are `TemporalBadge` minus `null` (no badge
   *  needs no word) — duplicated as a literal union rather than imported,
   *  since importing a feature type into the locale contract would run the
   *  `app → features → … → lib` dependency arrow backwards. `temporal.ts`
   *  indexes this record with an actual `TemporalBadge` value, so the two
   *  fail to compile together the moment they drift apart. */
  temporal: Record<'happening-now' | 'ended' | 'tonight' | 'tomorrow' | 'this-week', string>;
  /** "Beginner friendly" for a plain yes; the class start time otherwise. */
  beginnerClass: {
    friendly: string;
    /** Takes `{time}`. */
    atTime: string;
  };
  // The words `features/events/model/sections.ts` builds its filter prose
  // from. The filter *controls* themselves (search box, "Filter by Style"…)
  // stay hardcoded English in `FilterPanel.tsx` until S4 wires the panel —
  // only the words the pure filtering/summary logic produces move here.
  filters: {
    /** "All Venues" — the venue chip's "don't filter" sentinel, same idea as
     *  the style table's `filter` word. */
    allVenues: string;
    /** The noun in "`{count}` `{noun}`" above the grid. */
    eventNoun: PluralForms;
    /** Appended to the summary when "Live Music Only" is on. */
    liveMusicQualifier: string;
    /** Takes `{description}` and `{venue}`. */
    atVenue: string;
    /** Takes `{description}` and `{search}`. */
    matchingSearch: string;
    /** The empty-state heading, one template per combination of active
     *  filters — see `emptyStateHeading`. */
    emptyState: {
      /** Takes `{style}` and `{venue}`. */
      styleAndVenue: string;
      /** Takes `{style}`. */
      style: string;
      /** Takes `{venue}`. */
      venue: string;
      none: string;
    };
  };
}
