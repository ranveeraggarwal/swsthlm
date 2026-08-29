// Calendar arithmetic and week predicates over YYYY-MM-DD strings. Pure, no
// clock — every function takes its reference date as an argument, which is what
// makes the whole date layer testable and the homepage's SSR/hydration seeding
// possible. Reading the actual clock lives in `./clock.ts`.
//
// Everything here is **UTC-midnight arithmetic on date strings.** Nothing reads
// the runtime's local timezone, so a viewer in Los Angeles, a dancer in
// Stockholm and the UTC build server all agree on which week a date falls in.
//
// That was not always true. The week predicates used to parse a date to UTC
// midnight and then read it back with local-time methods (`getDay`, `setHours`,
// `setDate`), which shifted the weekday by a day for anyone west of Greenwich:
// on a Sunday, `isSunday` returned false in the Americas and the homepage's
// "Coming Up" promotion silently didn't fire (#248).
//
// So: if you add a function here, keep it string-in/string-out and build it on
// `addDays`. Do not reach for a `Date` method without `UTC` in its name.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a YYYY-MM-DD string as UTC midnight. */
function parseUTC(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

/**
 * Whether a string is a real YYYY-MM-DD date. The second check is what rejects
 * well-shaped nonsense like '2026-13-45'.
 *
 * The predicates below guard on this and return `false` rather than throwing.
 * Every date reaching them comes from `./clock.ts` or from CSVs that
 * `scripts/validate-data.mjs` gates, so malformed input is a programming error
 * — but a thrown RangeError deep in a render is a blank page for a dancer, and
 * a missing badge is not.
 */
function isIsoDate(value: string): boolean {
  return ISO_DATE.test(value) && !Number.isNaN(parseUTC(value).getTime());
}

/** Step a YYYY-MM-DD string by whole days, DST-safe. Negative steps back. */
export function addDays(iso: string, days: number): string {
  const d = parseUTC(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Day of the week as 0 = Sunday … 6 = Saturday, read at UTC. */
export function weekdayIndexOf(iso: string): number {
  return parseUTC(iso).getUTCDay();
}

/** "YYYY-MM" key for grouping events by month. */
export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/** Both are YYYY-MM-DD, which compares correctly as a plain string. */
export function isToday(dateStr: string, referenceDateStr: string): boolean {
  return dateStr === referenceDateStr;
}

/**
 * The Monday that starts the week containing `iso`. Monday-first: the Swedish
 * convention, and the week the homepage's "This Week" section means.
 */
function startOfWeek(iso: string): string {
  // weekdayIndexOf is Sunday-based; rotate so Monday is 0 and Sunday is 6.
  const daysSinceMonday = (weekdayIndexOf(iso) + 6) % 7;
  return addDays(iso, -daysSinceMonday);
}

/** Whether a date falls in the Mon–Sun block starting at `weekStart`. */
function isWithinWeek(dateStr: string, weekStart: string): boolean {
  return dateStr >= weekStart && dateStr <= addDays(weekStart, 6);
}

/** Whether a YYYY-MM-DD date is in the Mon–Sun week containing the reference date. */
export function isCurrentWeek(dateStr: string, referenceDateStr: string): boolean {
  if (!isIsoDate(dateStr) || !isIsoDate(referenceDateStr)) return false;
  return isWithinWeek(dateStr, startOfWeek(referenceDateStr));
}

/** Whether a YYYY-MM-DD date is in the Mon–Sun week *after* the reference date's. */
export function isNextWeek(dateStr: string, referenceDateStr: string): boolean {
  if (!isIsoDate(dateStr) || !isIsoDate(referenceDateStr)) return false;
  return isWithinWeek(dateStr, addDays(startOfWeek(referenceDateStr), 7));
}

/**
 * Whether the reference date is a Sunday. Drives the homepage's "promote next
 * week into the highlighted section" rule — on Sunday, this week is over.
 */
export function isSunday(referenceDateStr: string): boolean {
  return isIsoDate(referenceDateStr) && weekdayIndexOf(referenceDateStr) === 0;
}

/** Whether a YYYY-MM-DD date is the day after the reference date. */
export function isTomorrow(dateStr: string, referenceDateStr: string): boolean {
  if (!isIsoDate(referenceDateStr)) return false;
  return dateStr === addDays(referenceDateStr, 1);
}

/** Whether a YYYY-MM-DD date is the day before the reference date. */
export function isYesterday(dateStr: string, referenceDateStr: string): boolean {
  if (!isIsoDate(referenceDateStr)) return false;
  return dateStr === addDays(referenceDateStr, -1);
}
