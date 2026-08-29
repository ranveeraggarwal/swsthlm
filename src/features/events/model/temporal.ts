// "Is this happening now, tonight, tomorrow?" — the badge on every card.
//
// This is the only genuinely time-sensitive thing on the site. The event list is
// fixed at build time, but "now" is not, so these are computed client-side after
// hydration from a `Now` snapshot rather than read from a clock in render.
//
// Lives with the events model rather than in `lib/date` because it reasons about
// an event's start and end, not about dates in general.

import { isToday, isTomorrow, isYesterday } from '@/lib/date/calendar';
import type { Now } from '@/lib/date/clock';
import { bundle, DEFAULT_LOCALE, type Locale } from '@/i18n';
import type { SwingEvent } from './event';

/** Badge kinds, highest priority first. `null` means no badge. */
export type TemporalBadge =
  | 'happening-now'
  | 'ended'
  | 'tonight'
  | 'tomorrow'
  | 'this-week'
  | null;

/** The fields a badge is computed from — a whole SwingEvent isn't needed. */
type Timing = Pick<SwingEvent, 'date' | 'start' | 'end'>;

/**
 * Whether an event runs past midnight, e.g. 20:00–00:30.
 *
 * Strict `<`: an event whose end equals its start counts as same-day, so a
 * zero-length listing is treated as a moment in time rather than a 24-hour one.
 */
export function isOvernight({ start, end }: Timing): boolean {
  return end < start;
}

/**
 * Whether `now` falls inside the event's window. Times are HH:MM strings, which
 * compare correctly with `<=`; an overnight event matches on either side of
 * midnight — including the morning after its start date, once the calendar
 * date has rolled over but the event hasn't reached its end time yet.
 */
function isHappeningNow(timing: Timing, now: Now): boolean {
  if (!timing.start || !timing.end || !now.time) return false;

  if (timing.date === now.date) {
    return isOvernight(timing)
      ? now.time >= timing.start || now.time <= timing.end
      : now.time >= timing.start && now.time <= timing.end;
  }

  return isYesterday(timing.date, now.date) && isOvernight(timing) && now.time <= timing.end;
}

/**
 * Whether an event's window has entirely passed — used to drop stale events
 * from the listing altogether, distinct from the `ended` badge which still
 * shows a same-day event that's over. An overnight event stays "not past"
 * until its end time, even after the calendar date has rolled over.
 */
export function isPastEvent(timing: Timing, now: Now): boolean {
  if (timing.date >= now.date) return false;
  if (!timing.start || !timing.end || !now.time) return true;
  if (isYesterday(timing.date, now.date) && isOvernight(timing)) return now.time > timing.end;
  return true;
}

/**
 * The badge for an event.
 *
 * Priority: `happening-now` (which, for an overnight event, can mean either
 * its start date or the morning after); then a past date is `ended`; today is
 * `ended` once the end time has passed, otherwise `tonight`; then `tomorrow`,
 * then `this-week`, then nothing.
 *
 * `isThisWeek` is passed in rather than derived because the caller has already
 * bucketed events into sections and knows the answer — see `./sections.ts`.
 */
export function getTemporalBadge(timing: Timing, now: Now, isThisWeek: boolean): TemporalBadge {
  if (isHappeningNow(timing, now)) return 'happening-now';

  if (timing.date < now.date) return 'ended';

  if (isToday(timing.date, now.date)) {
    // An overnight event is never "ended" on its own start date — its end time
    // sorts before its start, so comparing against it would retire the event
    // before it began.
    if (!isOvernight(timing) && now.time > timing.end) return 'ended';
    return 'tonight';
  }

  if (isTomorrow(timing.date, now.date)) return 'tomorrow';
  if (isThisWeek) return 'this-week';
  return null;
}

/**
 * The badge's word — "Happening Now" / "Pågår nu", etc. Colour and layout
 * stay in `TemporalBadgeDisplay.tsx`; this is the single place the badge's
 * wording is decided, so a card and any other surface showing the same badge
 * can't disagree on what it says.
 */
export function temporalBadgeLabel(
  badge: NonNullable<TemporalBadge>,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return bundle(locale).temporal[badge];
}
