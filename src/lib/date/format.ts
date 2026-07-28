// Human-readable date strings. Pure functions from YYYY-MM-DD (or YYYY-MM) to
// display text — no clock, no domain knowledge, and as of #261 no `Intl`.
//
// Three rules hold for every function in this file, all learned the hard way:
//
//  1. **Read every date at UTC.** A date-only string parses as UTC midnight,
//     so reading it with a local-time getter rolls back a calendar day for
//     every viewer west of Greenwich — "1 Aug" renders as "31 Jul" (#160).
//     No `Date` method without `UTC` in its name appears below.
//
//  2. **Never `toLocaleDateString`.** ICU output is not guaranteed identical
//     across implementations, so Node (SSR/build) and a browser (hydration)
//     can disagree on punctuation alone — enough for React to flag a
//     hydration mismatch when nothing is actually wrong (#200).
//
//  3. **Never assume what ICU would have produced.** Two formats in this file
//     rendered something other than their own doc comments for months, and
//     the tests missed it because they only asserted `toContain`:
//     `formatEventDateShort` claimed "Wed 24 Jun" and produced "Wed, Jun 24";
//     `formatEventDateRange` claimed "Fri 28 & Sat 29 Aug" and produced
//     "28 Fri & 29 Sat Aug", because `en-US` orders a bare
//     `{ weekday, day }` as day-then-weekday. Both are fixed here, and every
//     format below is now pinned to an exact string by `format.test.ts`.
//
// Words and word order both live in the locale bundle: English says
// "Wednesday, Jun 3", Swedish says "onsdag 3 juni", and that difference is a
// template, not a translation.

import { bundle, DEFAULT_LOCALE, type Locale, type LocaleBundle } from '@/i18n';

type DateParts = {
  weekdayShort: string;
  weekdayLong: string;
  day: number;
  monthShort: string;
  monthLong: string;
  year: number;
};

const isValid = (d: Date) => !isNaN(d.getTime());

function datesOf(locale: Locale): LocaleBundle['dates'] {
  return bundle(locale).dates;
}

function partsOf(date: Date, dates: LocaleBundle['dates']): DateParts {
  return {
    weekdayShort: dates.weekdaysShort[date.getUTCDay()],
    weekdayLong: dates.weekdaysLong[date.getUTCDay()],
    day: date.getUTCDate(),
    monthShort: dates.monthsShort[date.getUTCMonth()],
    monthLong: dates.monthsLong[date.getUTCMonth()],
    year: date.getUTCFullYear(),
  };
}

/** Substitutes `{placeholder}` tokens. An unknown token is left as written
 *  rather than blanked, so a typo in a locale file is visible instead of
 *  silently deleting part of a date. */
function fill(template: string, parts: Partial<DateParts>): string {
  return template.replace(/\{(\w+)\}/g, (token, key: string) => {
    const value = parts[key as keyof DateParts];
    return value === undefined ? token : String(value);
  });
}

/**
 * "Wed 26 Aug" / "ons 26 aug" — short weekday, day, short month, no comma.
 * Used by the dense row list, which renders during SSR and again on hydration.
 */
export function formatCompactWeekdayDate(dateStr: string, locale: Locale = DEFAULT_LOCALE): string {
  const date = new Date(dateStr);
  if (!isValid(date)) return dateStr;
  const dates = datesOf(locale);
  return fill(dates.compactWeekdayDate, partsOf(date, dates));
}

/** "YYYY-MM" → "August 2026" / "augusti 2026". */
export function formatMonthHeading(monthKey: string, locale: Locale = DEFAULT_LOCALE): string {
  const date = new Date(`${monthKey}-01`);
  if (!isValid(date)) return monthKey;
  const dates = datesOf(locale);
  return fill(dates.monthHeading, partsOf(date, dates));
}

/** "Wed 24 Jun" / "ons 24 jun" — the card's date line. */
export function formatEventDateShort(dateStr: string, locale: Locale = DEFAULT_LOCALE): string {
  const date = new Date(dateStr);
  if (!isValid(date)) return dateStr;
  const dates = datesOf(locale);
  return fill(dates.eventDateShort, partsOf(date, dates));
}

/** "Wednesday, Jun 3" / "onsdag 3 juni" — date-section headings and the
 *  permalink date line. */
export function formatEventDate(dateStr: string, locale: Locale = DEFAULT_LOCALE): string {
  const date = new Date(dateStr);
  if (!isValid(date)) return dateStr;
  const dates = datesOf(locale);
  return fill(dates.eventDate, partsOf(date, dates));
}

/**
 * A multi-night run spelled out: "Fri 28 & Sat 29 Aug", or
 * "Fri 31 Jul & Sat 1 Aug" across a month boundary. Falls back to
 * `formatEventDate` when both dates are the same day.
 */
export function formatEventDateRange(
  firstDate: string,
  lastDate: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (firstDate === lastDate) return formatEventDate(firstDate, locale);

  const first = new Date(firstDate);
  const last = new Date(lastDate);
  if (!isValid(first) || !isValid(last)) return formatEventDate(firstDate, locale);

  const dates = datesOf(locale);
  const firstParts = partsOf(first, dates);
  const lastParts = partsOf(last, dates);
  const day = (parts: DateParts) => fill(dates.rangeDay, parts);
  const sep = dates.rangeSeparator;

  return first.getUTCMonth() === last.getUTCMonth()
    ? `${day(firstParts)} ${sep} ${day(lastParts)} ${lastParts.monthShort}`
    : `${day(firstParts)} ${firstParts.monthShort} ${sep} ${day(lastParts)} ${lastParts.monthShort}`;
}

/**
 * The tightest label we have, for the fixed-width date column in the row list:
 * "Wed 26 Aug" for one night, "26–27 Aug" or "26 Aug–1 Sep" for a run.
 */
export function formatCompactDateRange(dates: string[], locale: Locale = DEFAULT_LOCALE): string {
  if (dates.length <= 1) return formatCompactWeekdayDate(dates[0], locale);

  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);
  if (!isValid(first) || !isValid(last)) return formatCompactWeekdayDate(dates[0], locale);

  const words = datesOf(locale);
  const firstMonth = words.monthsShort[first.getUTCMonth()];
  const lastMonth = words.monthsShort[last.getUTCMonth()];

  return first.getUTCMonth() === last.getUTCMonth()
    ? `${first.getUTCDate()}–${last.getUTCDate()} ${lastMonth}`
    : `${first.getUTCDate()} ${firstMonth}–${last.getUTCDate()} ${lastMonth}`;
}
