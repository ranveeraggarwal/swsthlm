import { describe, expect, it } from 'vitest';
import {
  addDays,
  expandAll,
  expandOneoff,
  expandSeries,
  weekdayOf,
} from './expand';
import type { Exception, Oneoff, Series } from './types';

// --- Fixtures mirroring the committed /data CSVs (the three real series) ---

const chicagoLiveWeds: Series = {
  id: 'chicago-live-weds',
  name: 'Chicago Live Wednesdays',
  style: 'all',
  venueId: 'chicago',
  weekday: 'wednesday',
  start: '19:00',
  end: '23:00',
  price: '',
  beginnerClass: '19:00',
  music: 'live',
  organizer: 'Chicago Swing Dance Studio',
  url: 'https://www.chicago75.se',
  status: 'live',
  validFrom: '2026-06-03',
  validTo: '2026-06-17',
};

const zinkens: Series = {
  id: 'zinkens-rhythm-club',
  name: "Zinken's Rhythm Club",
  style: 'balboa',
  venueId: 'chicago',
  weekday: 'thursday',
  start: '20:30',
  end: '22:30',
  price: '100/80 kr',
  music: 'dj',
  organizer: 'Chicago Swing Dance Studio',
  url: 'https://www.chicago75.se/evenemang/zinkens-rhythm-club',
  status: 'live',
  validFrom: '2026-06-04',
  validTo: '2026-06-17',
};

const pTzzDah: Series = {
  id: 'p-tzz-dah',
  name: 'P-Tzz-Dah',
  style: 'lindy-hop',
  venueId: 'sprallen',
  weekday: 'tuesday',
  start: '17:00',
  end: '22:00',
  price: '50 kr',
  payment: 'Swish/cash',
  music: 'dj',
  dj: 'DJ Hank Hipshot',
  organizer: 'Sprallen',
  url: 'https://www.facebook.com/events/s/p-tzz-dah/',
  status: 'live',
  validFrom: '2026-06-09',
  validTo: '2026-08-31',
};

const exceptions: Exception[] = [
  { seriesId: 'chicago-live-weds', date: '2026-06-03', band: 'Double Trouble' },
  { seriesId: 'chicago-live-weds', date: '2026-06-10', band: 'Tommy Löbel Swing Band' },
  { seriesId: 'zinkens-rhythm-club', date: '2026-06-04', dj: 'Frida "Night Train" H. G.' },
  { seriesId: 'zinkens-rhythm-club', date: '2026-06-11', dj: 'JC & Johan' },
];

const danshuset: Oneoff = {
  id: 'danshuset-2026-08',
  name: 'Danshuset – Dans i Stadshuset',
  style: 'all',
  venueId: 'stadshuset',
  date: '2026-08-28',
  endDate: '2026-08-29',
  start: '20:00',
  end: '01:00',
  price: '295 kr',
  music: 'mixed',
  dj: 'Ciceronen Clabbe af Geijerstam',
  band: 'Stadshusorkestern',
  organizer: 'Stockholms stadshus',
  url: 'https://stadshuset.stockholm/danshuset',
  status: 'live',
};

const dates = (occ: { date: string }[]) => occ.map((o) => o.date);

// --- Calendar helpers ---

describe('date helpers are DST-immune (UTC calendar math)', () => {
  it('addDays steps whole calendar days regardless of DST', () => {
    // 2026-03-29 is the Europe/Stockholm spring-forward day.
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    // 2026-10-25 is the fall-back day.
    expect(addDays('2026-10-24', 1)).toBe('2026-10-25');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
    expect(addDays('2026-06-09', 7)).toBe('2026-06-16');
  });

  it('weekdayOf is correct around both DST switches', () => {
    expect(weekdayOf('2026-03-29')).toBe('sunday');
    expect(weekdayOf('2026-10-25')).toBe('sunday');
    expect(weekdayOf('2026-06-09')).toBe('tuesday');
  });
});

// --- Series expansion ---

describe('expandSeries', () => {
  it('emits one occurrence per matching weekday inside the window', () => {
    const occ = expandSeries(pTzzDah, [], { today: '2026-06-01', weeks: 10 });
    // valid_to 2026-08-31 is past the 10-week window (ends 2026-08-10),
    // so the window wins and clamps to 2026-08-04.
    expect(dates(occ)).toEqual([
      '2026-06-09',
      '2026-06-16',
      '2026-06-23',
      '2026-06-30',
      '2026-07-07',
      '2026-07-14',
      '2026-07-21',
      '2026-07-28',
      '2026-08-04',
    ]);
    expect(occ.every((o) => o.dj === 'DJ Hank Hipshot')).toBe(true);
  });

  it('never generates the past — lower bound clamps to today', () => {
    const occ = expandSeries(pTzzDah, [], { today: '2026-07-01', weeks: 10 });
    expect(occ[0].date).toBe('2026-07-07'); // first Tuesday >= today
  });

  it('honours valid_from as an inclusive lower edge', () => {
    const occ = expandSeries(pTzzDah, [], { today: '2026-06-01', weeks: 10 });
    expect(occ[0].date).toBe('2026-06-09'); // == valid_from, included
  });

  it('honours valid_to as an inclusive upper edge', () => {
    // Chicago caps at 2026-06-17 (a Wednesday). It must be included; the next
    // Wednesday (06-24) must not.
    const occ = expandSeries(chicagoLiveWeds, [], { today: '2026-06-01', weeks: 10 });
    expect(dates(occ)).toEqual(['2026-06-03', '2026-06-10', '2026-06-17']);
  });

  it('produces nothing when valid_to is already in the past', () => {
    const occ = expandSeries(chicagoLiveWeds, [], { today: '2026-07-01', weeks: 10 });
    expect(occ).toEqual([]);
  });

  it('produces nothing when valid_from is past the window', () => {
    const occ = expandSeries(pTzzDah, [], { today: '2026-01-01', weeks: 4 });
    expect(occ).toEqual([]); // window ends 2026-01-29, before valid_from
  });

  it('gates on status: ended and draft yield nothing', () => {
    expect(
      expandSeries({ ...pTzzDah, status: 'ended' }, [], { today: '2026-06-01' })
    ).toEqual([]);
    expect(
      expandSeries({ ...pTzzDah, status: 'draft' }, [], { today: '2026-06-01' })
    ).toEqual([]);
  });

  it('includes drafts only when explicitly asked (dev)', () => {
    const occ = expandSeries({ ...pTzzDah, status: 'draft' }, [], {
      today: '2026-06-01',
      weeks: 2,
      includeDrafts: true,
    });
    expect(occ.length).toBeGreaterThan(0);
  });
});

// --- Exceptions ---

describe('exception overlays', () => {
  it('applies per-(series,date) band/dj overrides', () => {
    const occ = expandSeries(chicagoLiveWeds, exceptions, { today: '2026-06-01', weeks: 10 });
    expect(occ.find((o) => o.date === '2026-06-03')!.band).toBe('Double Trouble');
    expect(occ.find((o) => o.date === '2026-06-10')!.band).toBe('Tommy Löbel Swing Band');
    // 06-17 has no exception (its band was "TBA"); band stays undefined → hidden.
    expect(occ.find((o) => o.date === '2026-06-17')!.band).toBeUndefined();
  });

  it('overlays the DJ for each Zinken occurrence', () => {
    const occ = expandSeries(zinkens, exceptions, { today: '2026-06-01', weeks: 10 });
    expect(dates(occ)).toEqual(['2026-06-04', '2026-06-11']);
    expect(occ[0].dj).toBe('Frida "Night Train" H. G.');
    expect(occ[1].dj).toBe('JC & Johan');
  });

  it('cancellation wins and ignores all other override columns', () => {
    const cancel: Exception[] = [
      // cancelled plus a stray dj override — the dj must NOT be applied.
      { seriesId: 'p-tzz-dah', date: '2026-06-09', cancelled: true, dj: 'Should Be Ignored' },
    ];
    const occ = expandSeries(pTzzDah, cancel, { today: '2026-06-01', weeks: 4 });
    const target = occ.find((o) => o.date === '2026-06-09')!;
    expect(target.cancelled).toBe(true);
    expect(target.dj).toBe('DJ Hank Hipshot'); // series default, not the override
  });
});

// --- DST boundary integrity for a long-running series ---

describe('weekly series stays on its weekday across DST switches', () => {
  const sundaySocial: Series = {
    id: 'dst-probe',
    name: 'DST Probe',
    style: 'all',
    venueId: 'chicago',
    weekday: 'sunday',
    start: '15:00',
    end: '18:00',
    price: 'Free',
    music: 'dj',
    organizer: 'Test',
    url: 'https://example.com',
    status: 'live',
    validFrom: '2026-03-01',
  };

  it('every occurrence is a Sunday and spans both switch days', () => {
    const occ = expandSeries(sundaySocial, [], { today: '2026-03-01', weeks: 40 });
    expect(occ.every((o) => weekdayOf(o.date) === 'sunday')).toBe(true);
    expect(dates(occ)).toContain('2026-03-29'); // spring forward
    expect(dates(occ)).toContain('2026-10-25'); // fall back
  });

  it('wall-clock start/end are untouched on the switch days', () => {
    const occ = expandSeries(sundaySocial, [], { today: '2026-03-01', weeks: 40 });
    const spring = occ.find((o) => o.date === '2026-03-29')!;
    const fall = occ.find((o) => o.date === '2026-10-25')!;
    expect(spring.start).toBe('15:00');
    expect(spring.end).toBe('18:00');
    expect(fall.start).toBe('15:00');
    expect(fall.end).toBe('18:00');
  });
});

// --- Oneoffs ---

describe('expandOneoff', () => {
  it('expands a multi-day run to one occurrence per day sharing the id', () => {
    const occ = expandOneoff(danshuset, { today: '2026-06-01' });
    expect(dates(occ)).toEqual(['2026-08-28', '2026-08-29']);
    expect(occ.every((o) => o.sourceId === 'danshuset-2026-08')).toBe(true);
    // Beyond the 10-week series horizon, but one-offs aren't windowed out.
  });

  it('drops days already in the past, keeps today onward', () => {
    const occ = expandOneoff({ ...danshuset, date: '2026-08-27', endDate: '2026-08-29' }, {
      today: '2026-08-28',
    });
    expect(dates(occ)).toEqual(['2026-08-28', '2026-08-29']);
  });

  it('marks every day cancelled when status is cancelled', () => {
    const occ = expandOneoff({ ...danshuset, status: 'cancelled' }, { today: '2026-06-01' });
    expect(occ.every((o) => o.cancelled)).toBe(true);
  });

  it('gates drafts', () => {
    expect(expandOneoff({ ...danshuset, status: 'draft' }, { today: '2026-06-01' })).toEqual([]);
    expect(
      expandOneoff({ ...danshuset, status: 'draft' }, { today: '2026-06-01', includeDrafts: true })
    ).toHaveLength(2);
  });

  it('never renders an ended one-off, even with includeDrafts (archived)', () => {
    expect(expandOneoff({ ...danshuset, status: 'ended' }, { today: '2026-06-01' })).toEqual([]);
    expect(
      expandOneoff({ ...danshuset, status: 'ended' }, { today: '2026-06-01', includeDrafts: true })
    ).toEqual([]);
  });
});

// --- Full pipeline ---

describe('expandAll', () => {
  it('merges series + oneoffs and sorts by date then start time', () => {
    const occ = expandAll(
      [chicagoLiveWeds, zinkens, pTzzDah],
      exceptions,
      [danshuset],
      { today: '2026-06-01', weeks: 10 }
    );
    // Output is globally sorted.
    const ds = dates(occ);
    expect([...ds]).toEqual([...ds].sort());
    // Same-day events ordered by start: 2026-06-09 has only P-Tzz-Dah;
    // check a constructed same-day tie instead.
    const sameDay = expandAll(
      [],
      [],
      [
        { ...danshuset, id: 'late', date: '2026-07-01', endDate: undefined, start: '21:00' },
        { ...danshuset, id: 'early', date: '2026-07-01', endDate: undefined, start: '18:00' },
      ],
      { today: '2026-06-01' }
    );
    expect(sameDay.map((o) => o.sourceId)).toEqual(['early', 'late']);
  });

  it('matches the expected June occurrence count for the real three series', () => {
    const occ = expandAll([chicagoLiveWeds, zinkens, pTzzDah], exceptions, [], {
      today: '2026-06-01',
      weeks: 10,
    });
    // Chicago: 3 (06-03/10/17), Zinken's: 2 (06-04/11), P-Tzz-Dah: 9 → 14.
    expect(occ).toHaveLength(14);
  });
});
