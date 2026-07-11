import { describe, it, expect } from 'vitest';
import type { DailyProgram, WeekSchedule } from './types';
import {
  classesOn,
  dailyFor,
  firstClassOnOrAfter,
  isClassFreeDay,
  isWeekWrapped,
  levelOptions,
  nowAndNextClass,
  selectedTrackIds,
  tonightStream,
  venueLabel,
  weekSpecialsOn,
} from './schedule';
import { toMinutes } from './time';

const venues = [
  { id: 'sp', name: "Small's Paradise", area: 'School Area' },
  { id: 'fh', name: 'Folketshus Ballroom', area: 'Folketshus Area' },
];

const week: WeekSchedule = {
  week: 2,
  year: 2026,
  start: '2026-07-11',
  end: '2026-07-17',
  tracks: [
    { id: 'interm-g1', name: 'Intermediate — Group 1', level: 'Intermediate', group: 1 },
    { id: 'interm-g2', name: 'Intermediate — Group 2', level: 'Intermediate', group: 2 },
    { id: 'balboa', name: 'Balboa', level: 'Balboa' },
  ],
  classes: [
    { track: 'interm-g1', date: '2026-07-13', start: '09:00', end: '10:10', venue: 'sp' },
    { track: 'interm-g1', date: '2026-07-13', start: '10:20', end: '11:30', venue: 'sp' },
    { track: 'interm-g2', date: '2026-07-13', start: '10:20', end: '11:30', venue: 'fh' },
    { track: 'balboa', date: '2026-07-14', start: '14:00', end: '15:10', venue: 'fh' },
    { track: 'interm-g1', date: '2026-07-17', start: '16:00', end: '17:10', venue: 'sp' },
  ],
  specials: [
    { title: 'Barbara Billups & Sugar Sullivan', date: '2026-07-15', start: '14:00', venues: ['fh'] },
  ],
};

describe('venue formula', () => {
  it('renders Venue · Area', () => {
    expect(venueLabel(venues, 'sp')).toBe("Small's Paradise · School Area");
    expect(venueLabel(venues, 'zz')).toBe('zz'); // unknown id degrades to the id
  });
});

describe('track selection', () => {
  it('groups split levels into one picker row', () => {
    const options = levelOptions(week);
    expect(options).toHaveLength(2);
    expect(options.find((o) => o.level === 'Intermediate')?.split).toBe(true);
    expect(options.find((o) => o.level === 'Balboa')?.split).toBe(false);
  });

  it("'unsure' resolves to both groups until set", () => {
    expect(
      selectedTrackIds(week, { levels: ['Intermediate'], groups: {} })
    ).toEqual(['interm-g1', 'interm-g2']);
    expect(
      selectedTrackIds(week, { levels: ['Intermediate'], groups: { Intermediate: 2 } })
    ).toEqual(['interm-g2']);
    expect(
      selectedTrackIds(week, { levels: ['Balboa'], groups: {} })
    ).toEqual(['balboa']);
  });
});

describe('day mode: now/next class', () => {
  const classes = classesOn(week, ['interm-g1'], '2026-07-13');

  it('mid-class shows current, gap shows next', () => {
    expect(nowAndNextClass(classes, toMinutes('09:30')).current?.start).toBe('09:00');
    expect(nowAndNextClass(classes, toMinutes('09:30')).next?.start).toBe('10:20');
    const gap = nowAndNextClass(classes, toMinutes('10:15'));
    expect(gap.current).toBeUndefined();
    expect(gap.next?.start).toBe('10:20');
    const done = nowAndNextClass(classes, toMinutes('12:00'));
    expect(done.current).toBeUndefined();
    expect(done.next).toBeUndefined();
  });
});

describe('the week landmarks', () => {
  it('Wednesday is class-free; class days are not', () => {
    expect(isClassFreeDay(week, '2026-07-15')).toBe(true);
    expect(isClassFreeDay(week, '2026-07-13')).toBe(false);
    expect(isClassFreeDay(week, '2026-07-20')).toBe(false); // outside the window
  });

  it('empty master schedule never reports class-free (placeholder guard)', () => {
    const empty = { ...week, classes: [] };
    expect(isClassFreeDay(empty, '2026-07-15')).toBe(false);
    expect(isWeekWrapped(empty, '2026-07-18', 0)).toBe(false);
  });

  it('the week wraps after Friday’s last class', () => {
    expect(isWeekWrapped(week, '2026-07-17', toMinutes('17:09'))).toBe(false);
    expect(isWeekWrapped(week, '2026-07-17', toMinutes('17:10'))).toBe(true);
    expect(isWeekWrapped(week, '2026-07-18', 0)).toBe(true);
  });

  it('finds the Wednesday special and the 5am “first class” lookup', () => {
    expect(weekSpecialsOn(week, '2026-07-15')[0]?.title).toMatch(/Barbara/);
    // At 5am on the 15th (class-free day) the next class for interm-g1 is Friday's.
    expect(firstClassOnOrAfter(week, ['interm-g1'], '2026-07-15')?.date).toBe('2026-07-17');
  });
});

describe('tonight stream', () => {
  const daily: DailyProgram = {
    date: '2026-07-11',
    weekday: 'Saturday',
    title: "Saturday's Activities",
    events: [
      { title: 'DJ Simon', venues: ['fh'], start: '00:00', end: '02:00', kind: 'dj' },
      { title: 'Variety Revue', venues: ['fh'], start: '21:00', end: '22:00', kind: 'show' },
      { title: 'Bedlam thing', venues: ['fh'], start: '21:00', end: '23:00', kind: 'social' },
    ],
    specials: [],
  };

  it('sorts on the poster timeline (after-midnight last) and groups same starts', () => {
    const stream = tonightStream(daily);
    expect(stream.map((g) => g.start)).toEqual(['21:00', '00:00']);
    expect(stream[0].events).toHaveLength(2);
  });

  it('dailyFor finds by poster date', () => {
    expect(dailyFor([daily], '2026-07-11')?.title).toBe("Saturday's Activities");
    expect(dailyFor([daily], '2026-07-12')).toBeUndefined();
  });
});
