// Human-readable date strings. Pure functions from YYYY-MM-DD (or YYYY-MM) to
// display text — no clock, no domain knowledge.
//
// Two rules hold for every function in this file, both learned the hard way:
//
//  1. **Always pass `timeZone: 'UTC'`.** A date-only string parses as UTC
//     midnight, so formatting it without an explicit timeZone rolls back a
//     calendar day for every viewer west of Greenwich — "1 Aug" renders as
//     "31 Jul". The `timezone-safe formatting` tests pin this.
//
//  2. **Prefer fixed arrays over Intl for combined weekday+day+month shapes.**
//     ICU output is not guaranteed byte-identical across implementations, so
//     Node (SSR/build) and a browser (hydration) can disagree on punctuation
//     alone — enough for React to flag a hydration mismatch when nothing is
//     actually wrong. See `formatCompactWeekdayDate`.

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const isValid = (d: Date) => !isNaN(d.getTime());

/** Short month name read at UTC, e.g. "Aug". */
function monthShort(d: Date): string {
  return MONTHS_SHORT[d.getUTCMonth()];
}

/**
 * "Wed 26 Aug" — short weekday, day, short month, no comma. Used by the dense
 * row list, which renders during SSR and again on hydration.
 *
 * Built from fixed arrays rather than `toLocaleDateString`: for the combined
 * `{ weekday, day, month }` shape Node rendered "Tue 14 Jul" while a browser
 * rendered "Tue, 14 Jul" from the identical call. Manual formatting sidesteps
 * the ICU dependency entirely, so this is byte-identical everywhere.
 */
export function formatCompactWeekdayDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (!isValid(date)) return dateStr;
  return `${WEEKDAYS_SHORT[date.getUTCDay()]} ${date.getUTCDate()} ${monthShort(date)}`;
}

/** "YYYY-MM" → "August 2026". */
export function formatMonthHeading(monthKey: string): string {
  try {
    const date = new Date(`${monthKey}-01`);
    if (!isValid(date)) return monthKey;
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  } catch {
    return monthKey;
  }
}

/** "Wed 24 Jun" — the card's date line. */
export function formatEventDateShort(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isValid(date)) return dateStr;
    return date.toLocaleDateString('en-US', {
      weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

/** "Wednesday, Jun 3" — date-section headings and the permalink date line. */
export function formatEventDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isValid(date)) return dateStr;
    return date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

/**
 * A multi-night run spelled out: "Fri 28 & Sat 29 Aug", or
 * "Fri 28 Aug & Sat 1 Sep" across a month boundary. Falls back to
 * `formatEventDate` when both dates are the same day.
 */
export function formatEventDateRange(firstDate: string, lastDate: string): string {
  if (firstDate === lastDate) return formatEventDate(firstDate);
  try {
    const first = new Date(firstDate);
    const last = new Date(lastDate);
    if (!isValid(first) || !isValid(last)) return formatEventDate(firstDate);

    const fmtDay = (d: Date) =>
      d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', timeZone: 'UTC' });

    return first.getUTCMonth() === last.getUTCMonth()
      ? `${fmtDay(first)} & ${fmtDay(last)} ${monthShort(last)}`
      : `${fmtDay(first)} ${monthShort(first)} & ${fmtDay(last)} ${monthShort(last)}`;
  } catch {
    return formatEventDate(firstDate);
  }
}

/**
 * The tightest label we have, for the fixed-width date column in the row list:
 * "Wed 26 Aug" for one night, "26–27 Aug" or "26 Aug–1 Sep" for a run.
 */
export function formatCompactDateRange(dates: string[]): string {
  if (dates.length <= 1) return formatCompactWeekdayDate(dates[0]);

  const first = new Date(dates[0]);
  const last = new Date(dates[dates.length - 1]);
  if (!isValid(first) || !isValid(last)) return formatCompactWeekdayDate(dates[0]);

  return first.getUTCMonth() === last.getUTCMonth()
    ? `${first.getUTCDate()}–${last.getUTCDate()} ${monthShort(last)}`
    : `${first.getUTCDate()} ${monthShort(first)}–${last.getUTCDate()} ${monthShort(last)}`;
}
