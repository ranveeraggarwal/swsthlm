// Pure, universal date/time + temporal-badge helpers. No I/O, no PapaParse —
// safe to import from client components. (Data loading lives in events.ts,
// which is server-only.) All reasoning is Europe/Stockholm local.

/**
 * Current date in Europe/Stockholm as a YYYY-MM-DD string.
 */
export function getStockholmCurrentDate(): string {
  const options = { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(new Date());
  const year = parts.find((p) => p.type === 'year')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';
  const day = parts.find((p) => p.type === 'day')?.value || '';
  return `${year}-${month}-${day}`;
}

/**
 * Current time in Europe/Stockholm as "HH:MM".
 */
export function getStockholmCurrentTime(): string {
  const options = { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit', hour12: false } as const;
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(new Date());
  const hour = parts.find((p) => p.type === 'hour')?.value || '00';
  const minute = parts.find((p) => p.type === 'minute')?.value || '00';
  return `${hour}:${minute}`;
}

/**
 * Checks if a YYYY-MM-DD date falls within "This Week" (Monday–Sunday)
 * relative to a reference date (defaults to now).
 */
export function isCurrentWeek(dateStr: string, referenceDateStr?: string): boolean {
  try {
    const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
    refDate.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    if (isNaN(targetDate.getTime())) return false;

    const day = refDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day; // Monday is 1, Sunday is 0
    const startOfWeek = new Date(refDate);
    startOfWeek.setDate(refDate.getDate() + diffToMonday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return targetDate >= startOfWeek && targetDate <= endOfWeek;
  } catch (error) {
    console.error('Error calculating isCurrentWeek:', error);
    return false;
  }
}

/**
 * Checks if a YYYY-MM-DD date falls within "Next Week" (the Monday–Sunday
 * block immediately following the current week).
 */
export function isNextWeek(dateStr: string, referenceDateStr?: string): boolean {
  try {
    const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
    refDate.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    if (isNaN(targetDate.getTime())) return false;

    const day = refDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const startOfThisWeek = new Date(refDate);
    startOfThisWeek.setDate(refDate.getDate() + diffToMonday);

    const startOfNextWeek = new Date(startOfThisWeek);
    startOfNextWeek.setDate(startOfThisWeek.getDate() + 7);

    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
    endOfNextWeek.setHours(23, 59, 59, 999);

    return targetDate >= startOfNextWeek && targetDate <= endOfNextWeek;
  } catch (error) {
    console.error('Error calculating isNextWeek:', error);
    return false;
  }
}

/**
 * Returns true if the reference date is a Sunday.
 */
export function isSunday(referenceDateStr: string): boolean {
  return new Date(referenceDateStr).getDay() === 0;
}

/**
 * Returns a "YYYY-MM" month key for grouping upcoming events by month.
 */
export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/**
 * Formats a "YYYY-MM" month key into a heading, e.g. "June 2026".
 */
export function formatMonthHeading(monthKey: string): string {
  try {
    const date = new Date(`${monthKey}-01`);
    if (isNaN(date.getTime())) return monthKey;
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return monthKey;
  }
}

/**
 * Formats a YYYY-MM-DD string into a short date, e.g. "Wed 24 Jun".
 */
export function formatEventDateShort(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

/**
 * Formats a YYYY-MM-DD string into a readable date, e.g. "Wednesday, Jun 3".
 */
export function formatEventDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats two YYYY-MM-DD strings into a compact date-range label.
 * Same month:  "Fri 28 & Sat 29 Aug"
 * Cross-month: "Fri 28 Aug & Sat 1 Sep"
 * If firstDate === lastDate, falls back to formatEventDate.
 */
export function formatEventDateRange(firstDate: string, lastDate: string): string {
  if (firstDate === lastDate) return formatEventDate(firstDate);
  try {
    const first = new Date(firstDate);
    const last = new Date(lastDate);
    if (isNaN(first.getTime()) || isNaN(last.getTime())) return formatEventDate(firstDate);

    const fmtDay = (d: Date) =>
      d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    const fmtMonth = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' });

    const sameMonth = first.getUTCMonth() === last.getUTCMonth();
    if (sameMonth) {
      return `${fmtDay(first)} & ${fmtDay(last)} ${fmtMonth(last)}`;
    }
    return `${fmtDay(first)} ${fmtMonth(first)} & ${fmtDay(last)} ${fmtMonth(last)}`;
  } catch {
    return formatEventDate(firstDate);
  }
}

/**
 * Checks if a YYYY-MM-DD date string is today relative to the reference date.
 */
export function isToday(dateStr: string, referenceDateStr: string): boolean {
  return dateStr === referenceDateStr;
}

/**
 * Checks if a YYYY-MM-DD date string is tomorrow relative to the reference date.
 */
export function isTomorrow(dateStr: string, referenceDateStr: string): boolean {
  try {
    const refDate = new Date(referenceDateStr);
    refDate.setDate(refDate.getDate() + 1);
    const tomorrow = refDate.toISOString().slice(0, 10);
    return dateStr === tomorrow;
  } catch {
    return false;
  }
}

/**
 * Checks if the current Stockholm time falls within an event's start–end window
 * on a given date. Handles overnight events (end < start, e.g. 20:00–00:30).
 */
export function isHappeningNow(
  dateStr: string,
  startTime: string,
  endTime: string,
  referenceDateStr: string,
  referenceTime: string
): boolean {
  if (dateStr !== referenceDateStr) return false;
  if (!startTime || !endTime || !referenceTime) return false;

  const current = referenceTime;
  if (startTime <= endTime) {
    return current >= startTime && current <= endTime;
  }
  return current >= startTime || current <= endTime;
}

/**
 * Temporal badge types in priority order.
 */
export type TemporalBadge = 'happening-now' | 'ended' | 'tonight' | 'tomorrow' | 'this-week' | null;

/**
 * Returns the appropriate temporal badge for an event.
 * Priority: ENDED (past date) > HAPPENING NOW > ENDED (today, finished) > TONIGHT > TOMORROW > THIS WEEK > null
 */
export function getTemporalBadge(
  dateStr: string,
  startTime: string,
  endTime: string,
  referenceDateStr: string,
  referenceTime: string,
  isThisWeek: boolean
): TemporalBadge {
  if (dateStr < referenceDateStr) {
    return 'ended';
  }
  if (isToday(dateStr, referenceDateStr)) {
    if (isHappeningNow(dateStr, startTime, endTime, referenceDateStr, referenceTime)) {
      return 'happening-now';
    }

    // Ended: today, not happening now, and the end time has passed.
    // We only flag this for same-day events (endTime >= startTime);
    // overnight events are treated as not-yet-ended.
    if (endTime >= startTime && referenceTime > endTime) {
      return 'ended';
    }

    return 'tonight';
  }
  if (isTomorrow(dateStr, referenceDateStr)) {
    return 'tomorrow';
  }
  if (isThisWeek) {
    return 'this-week';
  }
  return null;
}
