// The contract: every string a human translates lives on this type, in
// exactly one place. `en.ts` and `sv.ts` each `satisfies LocaleBundle`, so a
// key that's missing or misspelled in either file is a compile error — the
// same enforcement `features/events/model/labels.ts` gets from
// `Record<Style, StylePresentation>`, no lint rule or script involved.
//
// Chrome, dates and relative time live here today. S3 adds the remaining
// slot — `Record<Style, …>`, `Record<Music, …>`, `Record<FloorType, …>` word
// tables mirroring `features/events/model/labels.ts`. It isn't stubbed in
// below: an empty object would have to be filled with something to satisfy
// the type today, and that something would be fake.

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
}
