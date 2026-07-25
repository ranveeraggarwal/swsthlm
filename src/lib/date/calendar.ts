// Calendar arithmetic and week predicates over YYYY-MM-DD strings. Pure, no
// clock — every function takes its reference date as an argument, which is what
// makes the whole date layer testable and the homepage's SSR/hydration seeding
// possible. Reading the actual clock lives in `./clock.ts`.
//
// Two conventions coexist here, deliberately, and it matters which you use:
//
//   • `addDays` / `weekdayIndexOf` do calendar arithmetic at **UTC midnight**
//     (setUTCDate). This is the house convention for anything that steps
//     through dates — see the DST note in `lib/data/expand.ts`. A weekly series
//     can never drift onto the wrong weekday across a Europe/Stockholm DST
//     switch.
//
//   • The week predicates below (`isCurrentWeek`, `isNextWeek`, `isSunday`,
//     `isTomorrow`) use the **runtime's local** timezone. They are correct for
//     Europe/Stockholm (UTC+1/+2, where UTC midnight is still the same calendar
//     day locally) and for a UTC build server, which covers every environment
//     this site actually runs in. A viewer west of Greenwich can see the
//     "Coming Up" split and the Tomorrow badge shift by a day after hydration.
//     Left as-is on purpose so this refactor changed no behaviour; if you are
//     here to fix it, normalise all four onto UTC and update the tests.

/** Parse a YYYY-MM-DD string as UTC midnight. */
function parseUTC(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
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
 * Local midnight of the Monday that starts the week containing `referenceDateStr`.
 * Monday-first: Swedish convention, and the week the homepage's "This Week"
 * section means.
 */
function startOfWeekLocal(referenceDateStr: string): Date {
  const refDate = new Date(referenceDateStr);
  refDate.setHours(0, 0, 0, 0);
  const day = refDate.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(refDate);
  start.setDate(refDate.getDate() + diffToMonday);
  return start;
}

/** Whether `target` falls in the Mon–Sun block starting at `weekStart`. */
function isWithinWeek(target: Date, weekStart: Date): boolean {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return target >= weekStart && target <= weekEnd;
}

function localMidnight(dateStr: string): Date {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whether a YYYY-MM-DD date is in the Mon–Sun week containing the reference date. */
export function isCurrentWeek(dateStr: string, referenceDateStr?: string): boolean {
  try {
    const target = localMidnight(dateStr);
    if (isNaN(target.getTime())) return false;
    return isWithinWeek(target, startOfWeekLocal(referenceDateStr ?? new Date().toISOString()));
  } catch (error) {
    console.error('Error calculating isCurrentWeek:', error);
    return false;
  }
}

/** Whether a YYYY-MM-DD date is in the Mon–Sun week *after* the reference date's. */
export function isNextWeek(dateStr: string, referenceDateStr?: string): boolean {
  try {
    const target = localMidnight(dateStr);
    if (isNaN(target.getTime())) return false;
    const nextWeekStart = startOfWeekLocal(referenceDateStr ?? new Date().toISOString());
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    return isWithinWeek(target, nextWeekStart);
  } catch (error) {
    console.error('Error calculating isNextWeek:', error);
    return false;
  }
}

/**
 * Whether the reference date is a Sunday. Drives the homepage's "promote next
 * week into the highlighted section" rule — on Sunday, this week is over.
 */
export function isSunday(referenceDateStr: string): boolean {
  return new Date(referenceDateStr).getDay() === 0;
}

/** Whether a YYYY-MM-DD date is the day after the reference date. */
export function isTomorrow(dateStr: string, referenceDateStr: string): boolean {
  try {
    const refDate = new Date(referenceDateStr);
    refDate.setDate(refDate.getDate() + 1);
    return dateStr === refDate.toISOString().slice(0, 10);
  } catch {
    return false;
  }
}
