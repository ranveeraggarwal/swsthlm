import { describe, expect, it } from 'vitest';
import { addDays, isNextWeek, isSunday, isToday, isTomorrow, weekdayIndexOf } from './calendar';

describe('addDays', () => {
  it('steps forward and backward across month and year boundaries', () => {
    expect(addDays('2026-08-30', 3)).toBe('2026-09-02');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-07-14', 0)).toBe('2026-07-14');
  });

  it('does not drift across the Europe/Stockholm DST switches', () => {
    // Clocks go forward on 2026-03-29 and back on 2026-10-25. Stepping a week
    // over either boundary must land on the same weekday.
    expect(weekdayIndexOf('2026-03-25')).toBe(weekdayIndexOf(addDays('2026-03-25', 7)));
    expect(weekdayIndexOf('2026-10-21')).toBe(weekdayIndexOf(addDays('2026-10-21', 7)));
  });
});

describe('isToday / isTomorrow', () => {
  it('compares against the reference date', () => {
    expect(isToday('2026-07-25', '2026-07-25')).toBe(true);
    expect(isToday('2026-07-26', '2026-07-25')).toBe(false);
    expect(isTomorrow('2026-07-26', '2026-07-25')).toBe(true);
    expect(isTomorrow('2026-07-27', '2026-07-25')).toBe(false);
  });

  it('rolls tomorrow over a month boundary', () => {
    expect(isTomorrow('2026-08-01', '2026-07-31')).toBe(true);
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
});

describe('isSunday', () => {
  it('returns true for Sundays', () => {
    expect(isSunday('2025-05-25')).toBe(true);
    expect(isSunday('2026-06-21')).toBe(true);
  });

  it('returns false for other days', () => {
    expect(isSunday('2025-05-19')).toBe(false); // Monday
    expect(isSunday('2025-05-24')).toBe(false); // Saturday
  });
});
