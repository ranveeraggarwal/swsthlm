// Human-readable date strings. Pure functions from YYYY-MM-DD (or YYYY-MM) to
// display text — no clock, no domain knowledge.
//
// Two rules hold for every function in this file, both learned the hard way:
//
//  1. **Read every field at UTC.** A date-only string parses as UTC midnight,
//     so reading it back with local-time getters (or formatting it without an
//     explicit timeZone) rolls back a calendar day for every viewer west of
//     Greenwich — "1 Aug" renders as "31 Jul" (#160). The `timezone-safe
//     formatting` tests pin this under five host timezones.
//
//  2. **Never call `Intl`/`toLocaleDateString` here.** ICU output is not
//     guaranteed byte-identical across implementations, so Node (SSR/build)
//     and a browser (hydration) can disagree on punctuation alone — enough for
//     React to flag a hydration mismatch when nothing is actually wrong
//     (#200). Every string below is built from the fixed arrays in `WORDS`,
//     which makes output byte-identical on any host, in any timezone, under
//     any ICU build. Nothing here can throw, either, which is why the old
//     `try`/`catch` wrappers are gone: array indexing and template literals
//     have no failure mode that `isValid` doesn't already cover.
//
// Rule 2 is also why Swedish does *not* go through `sv-SE` Intl. It gets its
// own arrays, and — because Swedish orders the parts differently — its own
// templates. See `FORMATS`.

import type { Locale } from '@/lib/i18n/locale';

type LocaleWords = {
  /** Sunday-first, matching `Date.prototype.getUTCDay()`. */
  weekdaysShort: readonly string[];
  weekdaysLong: readonly string[];
  /** January-first, matching `Date.prototype.getUTCMonth()`. */
  monthsShort: readonly string[];
  monthsLong: readonly string[];
};

// Swedish weekday and month names are lowercase — "onsdag", "augusti", never
// "Onsdag" or "Augusti", including at the start of a heading. That is a
// spelling rule, not a style choice, so it is baked into the data rather than
// left to a CSS `capitalize` somewhere downstream.
const WORDS: Record<Locale, LocaleWords> = {
  en: {
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekdaysLong: [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ],
    monthsShort: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ],
    monthsLong: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  },
  sv: {
    weekdaysShort: ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'],
    weekdaysLong: [
      'söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag',
    ],
    monthsShort: [
      'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
      'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
    ],
    monthsLong: [
      'januari', 'februari', 'mars', 'april', 'maj', 'juni',
      'juli', 'augusti', 'september', 'oktober', 'november', 'december',
    ],
  },
};

/** Every name a template might want, all read at UTC. */
type DateParts = {
  weekdayShort: string;
  weekdayLong: string;
  day: number;
  monthShort: string;
  monthLong: string;
  year: number;
};

function partsOf(date: Date, locale: Locale): DateParts {
  const words = WORDS[locale];
  return {
    weekdayShort: words.weekdaysShort[date.getUTCDay()],
    weekdayLong: words.weekdaysLong[date.getUTCDay()],
    day: date.getUTCDate(),
    monthShort: words.monthsShort[date.getUTCMonth()],
    monthLong: words.monthsLong[date.getUTCMonth()],
    year: date.getUTCFullYear(),
  };
}

// Word *order* is a per-locale decision, not just vocabulary: English writes
// "Wednesday, Jun 24" and Swedish writes "onsdag 24 juni" — different order,
// no comma. So each shape that differs gets a template per locale rather than
// one template fed different arrays.
type LocaleFormats = {
  /** The dense row list's date, e.g. "Wed 26 Aug" / "ons 26 aug". */
  compactWeekday: (p: DateParts) => string;
  /** A month section heading, e.g. "August 2026" / "augusti 2026". */
  monthHeading: (p: DateParts) => string;
  /** The card's date line, e.g. "Wed, Jun 24" / "ons 24 jun". */
  eventDateShort: (p: DateParts) => string;
  /** Date headings and the permalink date line, e.g. "Wednesday, Jun 24" / "onsdag 24 juni". */
  eventDate: (p: DateParts) => string;
  /**
   * One day inside a spelled-out multi-night range — the month is appended by
   * `formatEventDateRange`, so this is weekday + day only: "28 Fri" / "fre 28".
   */
  rangeDay: (p: DateParts) => string;
};

const FORMATS: Record<Locale, LocaleFormats> = {
  // The English templates reproduce, byte for byte, what the previous
  // `toLocaleDateString('en-US', …)` implementation emitted under both Node's
  // and Chromium's ICU — including `eventDateShort`'s comma and `rangeDay`'s
  // day-before-weekday order, both of which read oddly and neither of which
  // matches the doc comments this file used to carry. Correcting the English
  // wording is a visible copy change and belongs in its own issue; this file's
  // job here was to remove the Intl dependency without moving the output.
  en: {
    compactWeekday: (p) => `${p.weekdayShort} ${p.day} ${p.monthShort}`,
    monthHeading: (p) => `${p.monthLong} ${p.year}`,
    eventDateShort: (p) => `${p.weekdayShort}, ${p.monthShort} ${p.day}`,
    eventDate: (p) => `${p.weekdayLong}, ${p.monthShort} ${p.day}`,
    rangeDay: (p) => `${p.day} ${p.weekdayShort}`,
  },
  // Swedish is consistently weekday-then-day-then-month with no comma, at
  // every length: "ons 26 aug", "onsdag 24 juni", "augusti 2026".
  sv: {
    compactWeekday: (p) => `${p.weekdayShort} ${p.day} ${p.monthShort}`,
    monthHeading: (p) => `${p.monthLong} ${p.year}`,
    eventDateShort: (p) => `${p.weekdayShort} ${p.day} ${p.monthShort}`,
    eventDate: (p) => `${p.weekdayLong} ${p.day} ${p.monthLong}`,
    rangeDay: (p) => `${p.weekdayShort} ${p.day}`,
  },
};

// The separator between the two nights of a spelled-out run. Swedish keeps the
// ampersand rather than spelling out "och": it sits in a fixed-width date
// column where "och" is three characters wider, and "&" reads the same in both
// languages. Deliberate, per the discussion on #261.
const RANGE_SEPARATOR = '&';

const isValid = (d: Date) => !isNaN(d.getTime());

/** Short month name read at UTC, e.g. "Aug" / "aug". */
function monthShort(d: Date, locale: Locale): string {
  return WORDS[locale].monthsShort[d.getUTCMonth()];
}

/**
 * "Wed 26 Aug" / "ons 26 aug" — short weekday, day, short month, no comma.
 * Used by the dense row list, which renders during SSR and again on hydration.
 */
export function formatCompactWeekdayDate(dateStr: string, locale: Locale = 'en'): string {
  const date = new Date(dateStr);
  if (!isValid(date)) return dateStr;
  return FORMATS[locale].compactWeekday(partsOf(date, locale));
}

/** "YYYY-MM" → "August 2026" / "augusti 2026". */
export function formatMonthHeading(monthKey: string, locale: Locale = 'en'): string {
  const date = new Date(`${monthKey}-01`);
  if (!isValid(date)) return monthKey;
  return FORMATS[locale].monthHeading(partsOf(date, locale));
}

/** "Wed, Jun 24" / "ons 24 jun" — the card's date line. */
export function formatEventDateShort(dateStr: string, locale: Locale = 'en'): string {
  const date = new Date(dateStr);
  if (!isValid(date)) return dateStr;
  return FORMATS[locale].eventDateShort(partsOf(date, locale));
}

/**
 * "Wednesday, Jun 24" / "onsdag 24 juni" — date-section headings and the
 * permalink date line.
 */
export function formatEventDate(dateStr: string, locale: Locale = 'en'): string {
  const date = new Date(dateStr);
  if (!isValid(date)) return dateStr;
  return FORMATS[locale].eventDate(partsOf(date, locale));
}

/**
 * A multi-night run spelled out: "28 Fri & 29 Sat Aug" / "fre 28 & lör 29 aug",
 * or "31 Fri Jul & 1 Sat Aug" / "fre 31 jul & lör 1 aug" across a month
 * boundary. Falls back to `formatEventDate` when both dates are the same day.
 */
export function formatEventDateRange(
  firstDate: string,
  lastDate: string,
  locale: Locale = 'en',
): string {
  if (firstDate === lastDate) return formatEventDate(firstDate, locale);

  const first = new Date(firstDate);
  const last = new Date(lastDate);
  if (!isValid(first) || !isValid(last)) return formatEventDate(firstDate, locale);

  const fmtDay = (d: Date) => FORMATS[locale].rangeDay(partsOf(d, locale));

  return first.getUTCMonth() === last.getUTCMonth()
    ? `${fmtDay(first)} ${RANGE_SEPARATOR} ${fmtDay(last)} ${monthShort(last, locale)}`
    : `${fmtDay(first)} ${monthShort(first, locale)} ${RANGE_SEPARATOR} `
      + `${fmtDay(last)} ${monthShort(last, locale)}`;
}

/**
 * The tightest label we have, for the fixed-width date column in the row list:
 * "Wed 26 Aug" for one night, "26–27 Aug" or "26 Aug–1 Sep" for a run.
 * Swedish uses the same shape with lowercase months: "26–27 aug".
 */
export function formatCompactDateRange(dates: string[], locale: Locale = 'en'): string {
  if (dates.length <= 1) return formatCompactWeekdayDate(dates[0], locale);

  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);
  if (!isValid(first) || !isValid(last)) return formatCompactWeekdayDate(dates[0], locale);

  return first.getUTCMonth() === last.getUTCMonth()
    ? `${first.getUTCDate()}–${last.getUTCDate()} ${monthShort(last, locale)}`
    : `${first.getUTCDate()} ${monthShort(first, locale)}–`
      + `${last.getUTCDate()} ${monthShort(last, locale)}`;
}
