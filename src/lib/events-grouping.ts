// Presentation-layer grouping for multi-day one-off events.
//
// The expansion layer (expand.ts) already emits one Occurrence per night for
// multi-day one-offs — that's correct for ICS (one VEVENT per night). This
// module collapses those per-night SwingEvents back into a single EventCard
// for rendering, without touching the expansion logic.
//
// Merge rules:
//   • Only 'oneoff' sourceType events are candidates.
//   • Events sharing the same sourceId AND forming consecutive calendar dates
//     are merged into one card.
//   • Series events (sourceType === 'series') are NEVER merged, even if they
//     happen to share a sourceId (they don't, but the guard is explicit).
//   • Single-occurrence cards (nightCount === 1) are identical to a plain card.

import type { SwingEvent, EventCard } from '@/types/event';
import { addDays } from '@/lib/data/expand';

/**
 * Groups a flat, date-sorted list of SwingEvents into EventCards.
 * Multi-day one-offs (same sourceId, consecutive dates) are collapsed into
 * one card. All other events are wrapped 1:1.
 *
 * Input must be sorted ascending by date (as produced by expandAll).
 */
export function groupMultiDayOneoffs(events: SwingEvent[]): EventCard[] {
  const cards: EventCard[] = [];
  // Map from sourceId -> index in cards[] for open oneoff groups.
  const openGroups = new Map<string, number>();

  for (const event of events) {
    if (event.sourceType === 'oneoff') {
      const groupIdx = openGroups.get(event.sourceId);
      if (groupIdx !== undefined) {
        const card = cards[groupIdx];
        const lastDate = card.dates[card.dates.length - 1];
        // Only merge if this night is the calendar-day after the last one.
        if (addDays(lastDate, 1) === event.date) {
          card.dates.push(event.date);
          card.nightCount += 1;
          // Update openGroups so the next night can extend this card.
          openGroups.set(event.sourceId, groupIdx);
          continue;
        }
        // Non-consecutive: close the old group, start a new one.
        openGroups.delete(event.sourceId);
      }
      // Start a new group for this oneoff.
      const idx = cards.length;
      cards.push({ event, dates: [event.date], nightCount: 1 });
      openGroups.set(event.sourceId, idx);
    } else {
      // Series events are always 1:1.
      cards.push({ event, dates: [event.date], nightCount: 1 });
    }
  }

  return cards;
}
