import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  formatCompactDateRange,
  formatCompactWeekdayDate,
  formatEventDateRange,
  formatEventDateShort,
  formatMonthHeading,
} from './format';

describe('formatEventDateRange', () => {
  it('returns single-date format when both dates are equal', () => {
    // Falls back to formatEventDate; result contains "Fri" and "Aug" for 2026-08-28.
    const result = formatEventDateRange('2026-08-28', '2026-08-28');
    expect(result).toContain('Aug');
    expect(result).toContain('28');
  });

  it('formats same-month range as "Fri 28 & Sat 29 Aug"', () => {
    const result = formatEventDateRange('2026-08-28', '2026-08-29');
    // Should contain both days and the shared month abbreviation once at the end.
    expect(result).toContain('28');
    expect(result).toContain('29');
    expect(result).toContain('Aug');
    expect(result).toContain('&');
  });

  it('formats cross-month range with both month abbreviations', () => {
    const result = formatEventDateRange('2026-07-31', '2026-08-01');
    expect(result).toContain('Jul');
    expect(result).toContain('Aug');
    expect(result).toContain('&');
  });
});

describe('formatCompactWeekdayDate', () => {
  it('formats as "Wed 26 Aug" — short weekday, day, short month, no comma', () => {
    // 2026-08-26 is a Wednesday.
    expect(formatCompactWeekdayDate('2026-08-26')).toBe('Wed 26 Aug');
  });

  it('is deterministic and does not depend on Intl/ICU output', () => {
    // Regression test for a hydration mismatch: Node's ICU formatted
    // `en-GB` { weekday: 'short', day: 'numeric', month: 'short' } without a
    // comma ("Tue 14 Jul"), while a browser's ICU formatted the identical
    // call with a comma ("Tue, 14 Jul") — same input, different output,
    // purely an implementation quirk of toLocaleDateString/Intl. Since this
    // function builds the string from fixed arrays instead, it must be
    // byte-identical everywhere and never contain a comma.
    const result = formatCompactWeekdayDate('2026-07-14');
    expect(result).toBe('Tue 14 Jul');
    expect(result).not.toContain(',');
  });

  it('returns the original string for an invalid date', () => {
    expect(formatCompactWeekdayDate('not-a-date')).toBe('not-a-date');
  });
});

// Date-only strings (YYYY-MM-DD) parse as UTC midnight. Formatting them with
// toLocaleDateString and no explicit timeZone rolls back a calendar day for
// any negative-UTC-offset viewer (all of the Americas), showing the wrong
// month/day. These pin the fix by running under such a timezone.
describe('timezone-safe formatting', () => {
  const originalTz = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = 'America/Los_Angeles';
  });

  afterEach(() => {
    process.env.TZ = originalTz;
  });

  it('formatMonthHeading is not shifted back a month', () => {
    expect(formatMonthHeading('2026-08')).toBe('August 2026');
  });

  it('formatEventDateShort is not shifted back a day', () => {
    const result = formatEventDateShort('2026-08-01');
    expect(result).toContain('Aug');
    expect(result).toContain('1');
    expect(result).not.toContain('31');
    expect(result).not.toContain('Jul');
  });

  it('formatEventDateRange month abbreviations are not shifted back', () => {
    const result = formatEventDateRange('2026-08-01', '2026-08-02');
    expect(result).toContain('Aug');
    expect(result).not.toContain('Jul');
  });

  it('formatCompactWeekdayDate is not shifted back a day', () => {
    expect(formatCompactWeekdayDate('2026-08-01')).toBe('Sat 1 Aug');
  });
});

describe('formatCompactDateRange', () => {
  it('uses the weekday form for a single night', () => {
    expect(formatCompactDateRange(['2026-08-26'])).toBe('Wed 26 Aug');
  });

  it('collapses a same-month run to one month name', () => {
    expect(formatCompactDateRange(['2026-08-26', '2026-08-27'])).toBe('26\u201327 Aug');
  });

  it('names both months across a boundary', () => {
    expect(formatCompactDateRange(['2026-08-30', '2026-09-01'])).toBe('30 Aug\u20131 Sep');
  });
});
