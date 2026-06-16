import { describe, expect, it } from 'vitest';
import { groupMultiDayOneoffs } from './events-grouping';
import type { SwingEvent } from '@/types/event';

// Minimal SwingEvent factory — only the fields groupMultiDayOneoffs cares about.
function makeEvent(overrides: Partial<SwingEvent> & Pick<SwingEvent, 'id' | 'date' | 'sourceType' | 'sourceId'>): SwingEvent {
  return {
    title: 'Test Event',
    status: 'published',
    start: '19:00',
    end: '23:00',
    venue: 'Test Venue',
    address: 'Test Address',
    style: 'all',
    music: 'dj',
    organizer: 'Test Org',
    body: '',
    ...overrides,
  };
}

const danshusetNight1 = makeEvent({
  id: 'danshuset-2026-08:2026-08-28',
  date: '2026-08-28',
  sourceType: 'oneoff',
  sourceId: 'danshuset-2026-08',
  start: '20:00',
  end: '01:00',
  title: 'Danshuset – Dans i Stadshuset',
});

const danshusetNight2 = makeEvent({
  id: 'danshuset-2026-08:2026-08-29',
  date: '2026-08-29',
  sourceType: 'oneoff',
  sourceId: 'danshuset-2026-08',
  start: '20:00',
  end: '01:00',
  title: 'Danshuset – Dans i Stadshuset',
});

const singleOneoff = makeEvent({
  id: 'tegels-2026-08-09:2026-08-09',
  date: '2026-08-09',
  sourceType: 'oneoff',
  sourceId: 'tegels-2026-08-09',
});

const seriesOcc1 = makeEvent({
  id: 'chicago-live-weds:2026-06-03',
  date: '2026-06-03',
  sourceType: 'series',
  sourceId: 'chicago-live-weds',
});

const seriesOcc2 = makeEvent({
  id: 'chicago-live-weds:2026-06-10',
  date: '2026-06-10',
  sourceType: 'series',
  sourceId: 'chicago-live-weds',
});

describe('groupMultiDayOneoffs', () => {
  it('merges consecutive oneoff nights into one card', () => {
    const cards = groupMultiDayOneoffs([danshusetNight1, danshusetNight2]);
    expect(cards).toHaveLength(1);
    expect(cards[0].nightCount).toBe(2);
    expect(cards[0].dates).toEqual(['2026-08-28', '2026-08-29']);
    // Key is the first night's id.
    expect(cards[0].event.id).toBe('danshuset-2026-08:2026-08-28');
  });

  it('leaves a single-night oneoff as a 1-night card', () => {
    const cards = groupMultiDayOneoffs([singleOneoff]);
    expect(cards).toHaveLength(1);
    expect(cards[0].nightCount).toBe(1);
    expect(cards[0].dates).toEqual(['2026-08-09']);
  });

  it('does NOT merge series occurrences sharing a sourceId', () => {
    const cards = groupMultiDayOneoffs([seriesOcc1, seriesOcc2]);
    expect(cards).toHaveLength(2);
    expect(cards[0].nightCount).toBe(1);
    expect(cards[1].nightCount).toBe(1);
  });

  it('does NOT merge non-consecutive oneoff nights with the same sourceId', () => {
    // Two events with same sourceId but a gap in between.
    const night1 = makeEvent({
      id: 'foo:2026-08-01',
      date: '2026-08-01',
      sourceType: 'oneoff',
      sourceId: 'foo',
    });
    const night3 = makeEvent({
      id: 'foo:2026-08-03',
      date: '2026-08-03',
      sourceType: 'oneoff',
      sourceId: 'foo',
    });
    const cards = groupMultiDayOneoffs([night1, night3]);
    expect(cards).toHaveLength(2);
    expect(cards[0].nightCount).toBe(1);
    expect(cards[1].nightCount).toBe(1);
  });

  it('handles the only-second-night-remaining case: renders as a 1-night card', () => {
    // expandOneoff drops past nights; if only night 2 is left in the stream,
    // it should appear as a normal single-night card, not a multi-night card.
    const cards = groupMultiDayOneoffs([danshusetNight2]);
    expect(cards).toHaveLength(1);
    expect(cards[0].nightCount).toBe(1);
    expect(cards[0].dates).toEqual(['2026-08-29']);
  });

  it('handles a mix of series and multi-day oneoffs in the same stream', () => {
    const events = [
      seriesOcc1,          // series, 2026-06-03
      seriesOcc2,          // series, 2026-06-10
      singleOneoff,        // oneoff (single night), 2026-08-09
      danshusetNight1,     // oneoff night 1, 2026-08-28
      danshusetNight2,     // oneoff night 2, 2026-08-29
    ];
    const cards = groupMultiDayOneoffs(events);
    // 2 series cards + 1 single oneoff + 1 merged danshuset = 4
    expect(cards).toHaveLength(4);
    const danshuset = cards.find((c) => c.event.sourceId === 'danshuset-2026-08');
    expect(danshuset?.nightCount).toBe(2);
    expect(danshuset?.dates).toEqual(['2026-08-28', '2026-08-29']);
  });

  it('returns empty list for empty input', () => {
    expect(groupMultiDayOneoffs([])).toEqual([]);
  });
});
