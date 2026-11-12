import { describe, expect, it } from 'vitest';
import type { SwingEvent } from './event';
import {
  ALL_VENUES,
  NO_FILTERS,
  availableStyles,
  availableVenues,
  emptyStateHeading,
  filterEvents,
  hasActiveFilters,
  summariseFilters,
  venueFilterLabel,
  type EventFilters,
} from './sections';

const baseEvent: SwingEvent = {
  id: 'test:2025-05-19',
  sourceId: 'test',
  sourceType: 'oneoff',
  title: 'Late Night Social',
  date: '2025-05-19',
  start: '20:00',
  end: '01:00',
  cancelled: false,
  venue: 'Nalen',
  address: 'Regeringsgatan 74',
  style: 'lindy-hop',
  music: 'live',
  organizer: 'Test Organizer',
  body: '',
};

// Only the Swedish branch of each function is asserted exactly here —
// `format.test.ts` established the pattern of exact-string assertions after
// `toContain` let two date formats drift from their own doc comments for
// months (#261). The English branch is covered by the byte-identical
// comparison in the S3 verification run, not duplicated here.

describe('venueFilterLabel', () => {
  it('translates the "no filter" sentinel in Swedish', () => {
    expect(venueFilterLabel(ALL_VENUES, 'sv')).toBe('Alla lokaler');
  });

  it('passes a real venue name through unchanged in either locale', () => {
    expect(venueFilterLabel('Nalen', 'sv')).toBe('Nalen');
  });
});

describe('emptyStateHeading', () => {
  const filters = (patch: Partial<EventFilters>): EventFilters => ({ ...NO_FILTERS, ...patch });

  it('names the style and venue in Swedish', () => {
    expect(
      emptyStateHeading(filters({ style: 'lindy-hop', venue: 'Nalen' }), 'sv'),
    ).toBe('Inga Lindy Hop-evenemang på Nalen just nu');
  });

  it('names only the style in Swedish', () => {
    expect(emptyStateHeading(filters({ style: 'balboa' }), 'sv')).toBe(
      'Inga Balboa-evenemang just nu',
    );
  });

  it('names only the venue in Swedish', () => {
    expect(emptyStateHeading(filters({ venue: 'Nalen' }), 'sv')).toBe(
      'Inga evenemang på Nalen just nu',
    );
  });

  it('falls back to the generic heading in Swedish', () => {
    expect(emptyStateHeading(NO_FILTERS, 'sv')).toBe('Inga evenemang matchar dina filter');
  });
});

describe('filterEvents', () => {
  it('keeps an overnight event past midnight, until its end time', () => {
    // The event's date is yesterday; the clock has rolled over to today, but
    // the event (20:00–01:00) hasn't ended yet.
    const kept = filterEvents([baseEvent], NO_FILTERS, { date: '2025-05-20', time: '00:45' });
    expect(kept).toEqual([baseEvent]);
  });

  it('drops the overnight event once its end time has passed', () => {
    const kept = filterEvents([baseEvent], NO_FILTERS, { date: '2025-05-20', time: '01:15' });
    expect(kept).toEqual([]);
  });

  it('drops an ordinary event from a prior date', () => {
    const sameNightNoOvernight = { ...baseEvent, start: '19:00', end: '22:00' };
    const kept = filterEvents([sameNightNoOvernight], NO_FILTERS, {
      date: '2025-05-20',
      time: '10:00',
    });
    expect(kept).toEqual([]);
  });

  it('keeps only 5/5 venues when the Best floor filter is on, and drops unrated ones', () => {
    const studio = { ...baseEvent, id: 'studio', danceability: 5 as const };
    const hall = { ...baseEvent, id: 'hall', danceability: 4 as const };
    const unrated = { ...baseEvent, id: 'unrated' };
    const now = { date: '2025-05-19', time: '12:00' };
    expect(filterEvents([studio, hall, unrated], { ...NO_FILTERS, bestFloorOnly: true }, now)).toEqual([
      studio,
    ]);
    expect(filterEvents([studio, hall, unrated], NO_FILTERS, now)).toEqual([studio, hall, unrated]);
  });
});

describe('hasActiveFilters', () => {
  it('counts the Best floor filter as active', () => {
    expect(hasActiveFilters({ ...NO_FILTERS, bestFloorOnly: true })).toBe(true);
    expect(hasActiveFilters(NO_FILTERS)).toBe(false);
  });
});

describe('summariseFilters', () => {
  it('pluralises the Swedish noun (invariant, unlike English)', () => {
    const one = summariseFilters({ ...NO_FILTERS, style: 'blues' }, 1, 'sv');
    const many = summariseFilters({ ...NO_FILTERS, style: 'blues' }, 3, 'sv');
    expect(one).toEqual({ kind: 'filtered', description: '1 Blues evenemang' });
    expect(many).toEqual({ kind: 'filtered', description: '3 Blues evenemang' });
  });

  it('translates the live-music qualifier, venue clause and search clause in Swedish', () => {
    const summary = summariseFilters(
      { search: 'blues', style: 'balboa', venue: 'Nalen', liveMusicOnly: true, bestFloorOnly: false },
      7,
      'sv',
    );
    expect(summary).toEqual({
      kind: 'filtered',
      description: '7 Balboa Livemusik evenemang på Nalen som matchar "blues"',
    });
  });

  it('adds the best-floors clause before the venue clause in Swedish', () => {
    const summary = summariseFilters(
      { ...NO_FILTERS, style: 'balboa', venue: 'Nalen', bestFloorOnly: true },
      2,
      'sv',
    );
    expect(summary).toEqual({
      kind: 'filtered',
      description: '2 Balboa evenemang på de bästa golven på Nalen',
    });
  });
});

describe('availableVenues', () => {
  const now = { date: '2025-05-19', time: '12:00' };
  const at = (venue: string, date: string, patch: Partial<SwingEvent> = {}): SwingEvent => ({
    ...baseEvent,
    id: `${venue}:${date}`,
    venue,
    date,
    start: '19:00',
    end: '23:00',
    ...patch,
  });

  it('drops venues whose only events have already passed', () => {
    const venues = availableVenues([at('Nalen', '2025-05-18'), at('Twang', '2025-05-20')], now);
    expect(venues).toEqual([ALL_VENUES, 'Twang']);
  });

  it('keeps a venue whose overnight event from yesterday is still running', () => {
    const late = at('Nalen', '2025-05-18', { start: '22:00', end: '01:00' });
    expect(availableVenues([late], { date: '2025-05-19', time: '00:30' })).toEqual([ALL_VENUES, 'Nalen']);
  });

  it('ignores cancelled nights', () => {
    expect(availableVenues([at('Nalen', '2025-05-20', { cancelled: true })], now)).toEqual([ALL_VENUES]);
  });

  it('puts studio floors first, then the busiest venues, then by name', () => {
    const venues = availableVenues(
      [
        at('Twang', '2025-05-20'),
        at('Twang', '2025-05-21'),
        at('Twang', '2025-05-22'),
        at('Nalen', '2025-05-20'),
        at('Källarbyn', '2025-05-20'),
        at('Swedish Swing Society', '2025-05-20', { danceability: 5 }),
        at('Chicago Swing Dance Studio', '2025-05-20', { danceability: 5 }),
        at('Chicago Swing Dance Studio', '2025-05-21', { danceability: 5 }),
      ],
      now,
    );
    expect(venues).toEqual([
      ALL_VENUES,
      'Chicago Swing Dance Studio',
      'Swedish Swing Society',
      'Twang',
      'Källarbyn',
      'Nalen',
    ]);
  });
});

describe('availableStyles', () => {
  const now = { date: '2025-05-19', time: '12:00' };
  const on = (style: SwingEvent['style'], date: string, patch: Partial<SwingEvent> = {}): SwingEvent => ({
    ...baseEvent,
    id: `${style}:${date}`,
    style,
    date,
    start: '19:00',
    end: '23:00',
    ...patch,
  });

  it('offers only styles with an upcoming, non-cancelled night', () => {
    const styles = availableStyles(
      [
        on('balboa', '2025-05-18'),
        on('shag', '2025-05-20', { cancelled: true }),
        on('lindy-hop', '2025-05-20'),
        on('all', '2025-05-20'),
      ],
      now,
    );
    expect(styles).toEqual(['all', 'lindy-hop']);
  });
});
