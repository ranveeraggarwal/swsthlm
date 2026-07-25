// Collapsing a multi-day one-off back into a single card.
//
// The expansion layer emits one Occurrence per night, which is what the ICS feed
// needs (one VEVENT per night) but not what a reader wants — a weekend workshop
// should be one card saying "2 nights", not two cards two rows apart. This is the
// only place that folds them back up, and it is pure presentation: expansion
// stays untouched.
//
// Rules:
//   • Only one-offs merge. Series events are always 1:1, even if two somehow
//     shared a source id — the guard is explicit rather than assumed.
//   • A run must be the same `sourceId` on *consecutive* calendar days. A one-off
//     that skips a day produces two cards, which is correct: they're two events
//     as far as a dancer's evening is concerned.

import { addDays } from '@/lib/date/calendar';
import type { EventGroup, SwingEvent } from './event';

/**
 * Group a date-ascending list of events into cards.
 *
 * Input must be sorted ascending by date — `expandAll` guarantees this, and the
 * consecutive-day check depends on it.
 */
export function groupMultiDayOneoffs(events: SwingEvent[]): EventGroup[] {
  const groups: EventGroup[] = [];
  /** sourceId -> index in `groups` of the run still open for extension. */
  const openRuns = new Map<string, number>();

  for (const event of events) {
    if (event.sourceType !== 'oneoff') {
      groups.push(singleNight(event));
      continue;
    }

    const openIndex = openRuns.get(event.sourceId);
    const openRun = openIndex === undefined ? undefined : groups[openIndex];

    if (openRun && addDays(lastDateOf(openRun), 1) === event.date) {
      openRun.dates.push(event.date);
      openRun.nightCount += 1;
      continue;
    }

    // Either the first night of this one-off, or a gap in the run — start a new
    // card and let it be the one that future nights extend.
    groups.push(singleNight(event));
    openRuns.set(event.sourceId, groups.length - 1);
  }

  return groups;
}

function singleNight(event: SwingEvent): EventGroup {
  return { event, dates: [event.date], nightCount: 1 };
}

function lastDateOf(group: EventGroup): string {
  return group.dates[group.dates.length - 1];
}

/** The last night of a run — what the date-range labels need. */
export function lastNightOf(group: EventGroup): string {
  return lastDateOf(group);
}

/** The night a card is filed under: the first of the run. */
export function firstNightOf(group: EventGroup): string {
  return group.dates[0];
}
