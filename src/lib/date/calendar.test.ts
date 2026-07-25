import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  addDays,
  getMonthKey,
  isCurrentWeek,
  isNextWeek,
  isSunday,
  isToday,
  isTomorrow,
  weekdayIndexOf,
} from './calendar';

describe('addDays', () => {
  it('steps forward and backward across month and year boundaries', () => {
    expect(addDays('2026-08-30', 3)).toBe('2026-09-02');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-07-14', 0)).toBe('2026-07-14');
  });

  it('handles a leap day', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('does not drift across the Europe/Stockholm DST switches', () => {
    // Clocks go forward on 2026-03-29 and back on 2026-10-25. Stepping a week
    // over either boundary must land on the same weekday.
    expect(weekdayIndexOf('2026-03-25')).toBe(weekdayIndexOf(addDays('2026-03-25', 7)));
    expect(weekdayIndexOf('2026-10-21')).toBe(weekdayIndexOf(addDays('2026-10-21', 7)));
  });
});

describe('getMonthKey', () => {
  it('takes the YYYY-MM prefix', () => {
    expect(getMonthKey('2026-08-26')).toBe('2026-08');
  });
});

describe('isToday / isTomorrow', () => {
  it('compares against the reference date', () => {
    expect(isToday('2026-07-25', '2026-07-25')).toBe(true);
    expect(isToday('2026-07-26', '2026-07-25')).toBe(false);
    expect(isTomorrow('2026-07-26', '2026-07-25')).toBe(true);
    expect(isTomorrow('2026-07-27', '2026-07-25')).toBe(false);
  });

  it('rolls tomorrow over month and year boundaries', () => {
    expect(isTomorrow('2026-08-01', '2026-07-31')).toBe(true);
    expect(isTomorrow('2027-01-01', '2026-12-31')).toBe(true);
  });
});

describe('isCurrentWeek', () => {
  // 2026-07-20 is a Monday; the week runs Mon 20 – Sun 26 Jul.
  const monday = '2026-07-20';

  it('includes both ends of the Mon–Sun block', () => {
    expect(isCurrentWeek('2026-07-20', monday)).toBe(true); // Monday
    expect(isCurrentWeek('2026-07-26', monday)).toBe(true); // Sunday
  });

  it('excludes the days either side', () => {
    expect(isCurrentWeek('2026-07-19', monday)).toBe(false); // previous Sunday
    expect(isCurrentWeek('2026-07-27', monday)).toBe(false); // next Monday
  });

  it('resolves the same week from any day inside it', () => {
    for (const reference of ['2026-07-20', '2026-07-23', '2026-07-26']) {
      expect(isCurrentWeek('2026-07-22', reference)).toBe(true);
      expect(isCurrentWeek('2026-07-27', reference)).toBe(false);
    }
  });

  it('treats Sunday as the end of the week, not the start', () => {
    // The Sunday-based mistake would put Mon 27 in the same week as Sun 26.
    expect(isCurrentWeek('2026-07-27', '2026-07-26')).toBe(false);
  });
});

describe('isNextWeek', () => {
  // 2025-05-19 is a Monday.
  const monday = '2025-05-19';

  it('returns true for dates in the following Mon–Sun block', () => {
    expect(isNextWeek('2025-05-26', monday)).toBe(true); // next Monday
    expect(isNextWeek('2025-05-28', monday)).toBe(true); // next Wednesday
    expect(isNextWeek('2025-06-01', monday)).toBe(true); // next Sunday
  });

  it('returns false for dates in the current week', () => {
    expect(isNextWeek('2025-05-19', monday)).toBe(false);
    expect(isNextWeek('2025-05-25', monday)).toBe(false); // this Sunday
  });

  it('returns false for dates two weeks out', () => {
    expect(isNextWeek('2025-06-02', monday)).toBe(false);
  });

  it('works when the reference date is a Sunday', () => {
    const sunday = '2025-05-25';
    // Next week from Sunday = Mon May 26 – Sun Jun 1.
    expect(isNextWeek('2025-05-26', sunday)).toBe(true);
    expect(isNextWeek('2025-06-01', sunday)).toBe(true);
    expect(isNextWeek('2025-06-02', sunday)).toBe(false);
  });

  it('spans a month boundary', () => {
    // Mon 2026-08-31 is in the week after Mon 2026-08-24.
    expect(isNextWeek('2026-08-31', '2026-08-24')).toBe(true);
  });
});

describe('isSunday', () => {
  it('returns true for Sundays', () => {
    expect(isSunday('2025-05-25')).toBe(true);
    expect(isSunday('2026-06-21')).toBe(true);
    expect(isSunday('2026-07-26')).toBe(true);
  });

  it('returns false for other days', () => {
    expect(isSunday('2025-05-19')).toBe(false); // Monday
    expect(isSunday('2025-05-24')).toBe(false); // Saturday
  });
});

describe('malformed input', () => {
  // These can only arrive via a programming error — the clock and the validated
  // CSVs never produce them — but they must not throw inside a render.
  const bad = ['', 'not-a-date', '2026-13-45', '26-07-2026', '2026-07'];

  it('returns false rather than throwing', () => {
    for (const value of bad) {
      expect(isCurrentWeek(value, '2026-07-26')).toBe(false);
      expect(isCurrentWeek('2026-07-26', value)).toBe(false);
      expect(isNextWeek(value, '2026-07-26')).toBe(false);
      expect(isNextWeek('2026-07-26', value)).toBe(false);
      expect(isSunday(value)).toBe(false);
      expect(isTomorrow('2026-07-27', value)).toBe(false);
    }
  });
});

// Regression pin for #248. These four predicates used to read UTC-midnight dates
// back with local-time methods, so a viewer west of Greenwich got a weekday
// shifted by one: on a Sunday, `isSunday` returned false and the homepage's
// "Coming Up" promotion never fired. Every assertion here fails against that
// implementation and must keep passing under any host timezone.
describe('timezone independence (#248)', () => {
  const original = process.env.TZ;
  afterEach(() => {
    process.env.TZ = original;
  });

  // 2026-07-26 is a Sunday; 2026-07-27 is the Monday of the following week.
  const assertions = () => {
    expect(isSunday('2026-07-26')).toBe(true);
    expect(isNextWeek('2026-07-27', '2026-07-26')).toBe(true);
    expect(isCurrentWeek('2026-07-26', '2026-07-26')).toBe(true);
    expect(isCurrentWeek('2026-07-27', '2026-07-26')).toBe(false);
    expect(isTomorrow('2026-07-27', '2026-07-26')).toBe(true);
    expect(weekdayIndexOf('2026-07-26')).toBe(0);
  };

  for (const tz of [
    'Europe/Stockholm', // the audience
    'UTC', // the build server
    'America/Los_Angeles', // UTC-7/-8 — where the bug showed
    'America/New_York', // UTC-4/-5
    'Pacific/Kiritimati', // UTC+14, the far side
  ]) {
    it(`holds under TZ=${tz}`, () => {
      process.env.TZ = tz;
      assertions();
    });
  }
});

// The behaviour the bug actually broke, at the level a reader cares about:
// on a Sunday the homepage promotes next week into the highlighted section.
// `buildSections` decides that with `isSunday(currentDate) || thisWeek.length === 0`.
describe('the Sunday promotion rule these predicates drive', () => {
  const original = process.env.TZ;
  beforeEach(() => {
    process.env.TZ = 'America/Los_Angeles';
  });
  afterEach(() => {
    process.env.TZ = original;
  });

  it('recognises Sunday from the Americas, so the promotion fires', () => {
    const sunday = '2026-07-26';
    expect(isSunday(sunday)).toBe(true);
    // …and next week's Monday is correctly *next* week, so it gets promoted
    // rather than being mistaken for part of the current one.
    expect(isNextWeek('2026-07-27', sunday)).toBe(true);
    expect(isCurrentWeek('2026-07-27', sunday)).toBe(false);
  });
});
