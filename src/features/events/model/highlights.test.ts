import { describe, expect, it } from 'vitest';
import type { Now } from '@/lib/date/clock';
import type { SwingEvent } from './event';
import { bandstand, dedicatedNights, musicStats } from './highlights';

const now: Now = { date: '2026-11-11', time: '18:00' };

let seq = 0;
function ev(patch: Partial<SwingEvent>): SwingEvent {
  const date = patch.date ?? '2026-11-12';
  const sourceId = patch.sourceId ?? `e${seq++}`;
  return {
    id: `${sourceId}:${date}`,
    sourceId,
    sourceType: 'series',
    title: 'Social',
    date,
    start: '19:00',
    end: '22:00',
    cancelled: false,
    venue: 'Nalen',
    address: 'Regeringsgatan 74',
    style: 'all',
    music: 'live',
    organizer: 'Org',
    body: '',
    ...patch,
  };
}

describe('bandstand', () => {
  it('lists each band once, at its next night, counting the rest', () => {
    const events = [
      ev({ band: 'Hornsgatan Ramblers', date: '2026-11-12' }),
      ev({ band: 'Jubilee Stompers', date: '2026-11-13' }),
      ev({ band: 'hornsgatan ramblers ', date: '2026-11-19' }),
    ];
    const entries = bandstand(events, now);
    expect(entries.map((e) => [e.band, e.event.date, e.moreNights])).toEqual([
      ['Hornsgatan Ramblers', '2026-11-12', 1],
      ['Jubilee Stompers', '2026-11-13', 0],
    ]);
  });

  it('skips DJ nights, unnamed bands, cancelled and finished nights', () => {
    const events = [
      ev({ music: 'dj', band: 'Not A Band' }),
      ev({ band: undefined }),
      ev({ band: 'Called Off', cancelled: true }),
      ev({ band: 'Already Played', date: '2026-11-11', start: '12:00', end: '14:00' }),
      ev({ band: 'Past', date: '2026-11-01' }),
      ev({ band: 'Mixed Night', music: 'mixed' }),
    ];
    expect(bandstand(events, now).map((e) => e.band)).toEqual(['Mixed Night']);
  });

  it('stops at the limit', () => {
    const events = Array.from({ length: 10 }, (_, i) => ev({ band: `Band ${i}` }));
    expect(bandstand(events, now, 4)).toHaveLength(4);
  });
});

describe('musicStats', () => {
  it('counts live and DJ nights, with mixed in both, and distinct bands', () => {
    const events = [
      ev({ band: 'A' }),
      ev({ band: 'a' }),
      ev({ band: 'B', music: 'mixed' }),
      ev({ music: 'live' }),
      ev({ music: 'dj' }),
      ev({ music: 'dj', cancelled: true }),
    ];
    expect(musicStats(events, now)).toEqual({ liveNights: 4, bands: 2, djNights: 2 });
  });
});

describe('dedicatedNights', () => {
  it('counts only nights given to that dance, not all-styles socials', () => {
    const events = [
      ev({ style: 'balboa' }),
      ev({ style: 'balboa' }),
      ev({ style: 'blues' }),
      ev({ style: 'all' }),
      ev({ style: 'rock-n-roll' }),
      ev({ style: 'lindy-hop', date: '2026-11-01' }),
    ];
    expect(dedicatedNights(events, now)).toEqual({ 'lindy-hop': 0, balboa: 2, shag: 0, blues: 1 });
  });
});
