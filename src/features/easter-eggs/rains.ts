// The rains: one-day easter eggs where an icon appears after the homepage's
// hero title and every click on it drops another one down the screen.
//
// Adding one is three steps:
//   1. Drop the artwork in `./svg/` — a self-contained SVG, fixed colours (the
//      thing should look like itself in dark mode too).
//   2. Add an entry to `RAINS` below with the day it runs.
//   3. Add its button label to `rains` in both `src/i18n/en.ts` and `sv.ts` —
//      the id is keyed off that bundle, so step 2 is a compile error until the
//      words exist.
//
// Preview any rain on any day with `?rain=<id>`.

import type { StaticImageData } from 'next/image';
import type { LocaleBundle } from '@/i18n/bundle';
import kanelbulle from './svg/kanelbulle.svg';

export type RainId = keyof LocaleBundle['rains'];

export interface Rain {
  id: RainId;
  /** The day it runs, as MM-DD in Stockholm. */
  monthDay: string;
  icon: StaticImageData;
}

export const RAINS: readonly Rain[] = [
  // Kanelbullens dag — Cinnamon Bun Day.
  { id: 'kanelbulle', monthDay: '10-04', icon: kanelbulle },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The rain for a Stockholm YYYY-MM-DD date, or `null` on an ordinary day.
 * `forcedId` (from `?rain=`) wins regardless of the date. A string check rather
 * than a `Date`, for the same reasons as `lib/date/calendar.ts`.
 */
export function rainFor(dateStr: string, forcedId?: string | null): Rain | null {
  const forced = RAINS.find((rain) => rain.id === forcedId);
  if (forced) return forced;
  if (!ISO_DATE.test(dateStr)) return null;
  return RAINS.find((rain) => rain.monthDay === dateStr.slice(5)) ?? null;
}
