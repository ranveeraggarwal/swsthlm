// "What time is it in Stockholm?" — the only part of the date layer that reads
// a real clock. Everything else in `lib/date` is a pure function of strings.
//
// Kept separate because it is the one impure thing here, and because static
// HTML cannot know the current time: pages seed their first render with the
// build-time value and re-read these after hydration. Isolating them makes it
// obvious which calls are the hydration-sensitive ones.

const STOCKHOLM = 'Europe/Stockholm';

function stockholmParts(options: Intl.DateTimeFormatOptions, now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: STOCKHOLM, ...options }).formatToParts(now);
  return (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
}

/** Current date in Europe/Stockholm as a YYYY-MM-DD string. */
export function getStockholmCurrentDate(now: Date = new Date()): string {
  const part = stockholmParts({ year: 'numeric', month: '2-digit', day: '2-digit' }, now);
  return `${part('year') || ''}-${part('month') || ''}-${part('day') || ''}`;
}

/** Current time in Europe/Stockholm as "HH:MM" (24-hour). */
export function getStockholmCurrentTime(now: Date = new Date()): string {
  const part = stockholmParts({ hour: '2-digit', minute: '2-digit', hour12: false }, now);
  return `${part('hour') || '00'}:${part('minute') || '00'}`;
}

/**
 * A snapshot of the Stockholm clock, passed down through the event components.
 *
 * It travels as a value rather than being read where it's needed so that every
 * badge on a render agrees on what "now" is, and so the server can seed the
 * first paint with the build-time reading — static HTML cannot know the current
 * time, and a component reading the clock during render would mismatch on
 * hydration.
 */
export interface Now {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export function stockholmNow(at: Date = new Date()): Now {
  return { date: getStockholmCurrentDate(at), time: getStockholmCurrentTime(at) };
}
