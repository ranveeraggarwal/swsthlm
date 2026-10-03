// Kanelbullens dag — Cinnamon Bun Day — is 4 October every year.
//
// A string check on the YYYY-MM-DD the Stockholm clock hands back, rather than
// a `Date`, for the same reasons as `lib/date/calendar.ts`: nothing here reads
// the runtime's timezone, so the day starts at Stockholm midnight for everyone.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Whether a YYYY-MM-DD date is 4 October. */
export function isCinnamonBunDay(dateStr: string): boolean {
  return ISO_DATE.test(dateStr) && dateStr.slice(5) === '10-04';
}
