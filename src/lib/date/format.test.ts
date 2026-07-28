import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  formatCompactDateRange,
  formatCompactWeekdayDate,
  formatEventDate,
  formatEventDateRange,
  formatEventDateShort,
  formatMonthHeading,
} from './format';

// Every assertion below is an exact string, on purpose. The looser
// `toContain` assertions this file used to carry passed for months while two
// formats rendered something other than their own doc comments:
// `formatEventDateShort` produced "Wed, Jun 24" (not "Wed 24 Jun") and
// `formatEventDateRange` produced "28 Fri & 29 Sat Aug" (not
// "Fri 28 & Sat 29 Aug"), because `en-US` orders a bare `{ weekday, day }`
// as day-then-weekday. A test that only checks the digits are present cannot
// see word order.

describe('formatEventDateRange', () => {
  it('returns the single-date format when both dates are equal', () => {
    expect(formatEventDateRange('2026-08-28', '2026-08-28')).toBe('Friday, Aug 28');
  });

  it('formats a same-month range with the month named once, at the end', () => {
    expect(formatEventDateRange('2026-08-28', '2026-08-29')).toBe('Fri 28 & Sat 29 Aug');
  });

  it('names both months across a boundary', () => {
    expect(formatEventDateRange('2026-07-31', '2026-08-01')).toBe('Fri 31 Jul & Sat 1 Aug');
  });

  it('formats a range in Swedish', () => {
    expect(formatEventDateRange('2026-08-28', '2026-08-29', 'sv')).toBe('fre 28 & lör 29 aug');
    expect(formatEventDateRange('2026-07-31', '2026-08-01', 'sv')).toBe('fre 31 jul & lör 1 aug');
  });
});

describe('formatCompactWeekdayDate', () => {
  it('formats as "Wed 26 Aug" — short weekday, day, short month, no comma', () => {
    expect(formatCompactWeekdayDate('2026-08-26')).toBe('Wed 26 Aug');
  });

  it('formats as "ons 26 aug" in Swedish — lowercase throughout', () => {
    expect(formatCompactWeekdayDate('2026-08-26', 'sv')).toBe('ons 26 aug');
  });

  it('is deterministic and does not depend on Intl/ICU output', () => {
    // Regression test for a hydration mismatch: Node's ICU formatted
    // `{ weekday: 'short', day: 'numeric', month: 'short' }` without a comma
    // ("Tue 14 Jul"), while a browser's ICU formatted the identical call with
    // one ("Tue, 14 Jul") — same input, different output, purely an
    // implementation quirk of toLocaleDateString/Intl (#200). Every format in
    // this file is now built from fixed arrays, so it must be byte-identical
    // everywhere and never contain a comma.
    expect(formatCompactWeekdayDate('2026-07-14')).toBe('Tue 14 Jul');
    expect(formatCompactWeekdayDate('2026-07-14', 'sv')).toBe('tis 14 jul');
  });

  it('returns the original string for an invalid date', () => {
    expect(formatCompactWeekdayDate('not-a-date')).toBe('not-a-date');
    expect(formatCompactWeekdayDate('not-a-date', 'sv')).toBe('not-a-date');
  });
});

describe('formatEventDate', () => {
  it('formats as "Wednesday, Jun 3" in English', () => {
    expect(formatEventDate('2026-06-03')).toBe('Wednesday, Jun 3');
  });

  it('formats as "onsdag 3 juni" in Swedish — no comma, day before month', () => {
    expect(formatEventDate('2026-06-03', 'sv')).toBe('onsdag 3 juni');
  });
});

describe('formatEventDateShort', () => {
  it('formats as "Wed 24 Jun" — matching the row list, not "Wed, Jun 24"', () => {
    expect(formatEventDateShort('2026-06-24')).toBe('Wed 24 Jun');
  });

  it('formats as "ons 24 jun" in Swedish', () => {
    expect(formatEventDateShort('2026-06-24', 'sv')).toBe('ons 24 jun');
  });
});

describe('formatMonthHeading', () => {
  it('formats as "August 2026" in English', () => {
    expect(formatMonthHeading('2026-08')).toBe('August 2026');
  });

  it('formats as "augusti 2026" in Swedish', () => {
    expect(formatMonthHeading('2026-08', 'sv')).toBe('augusti 2026');
  });

  it('returns the original key when it cannot be parsed', () => {
    // A realistic malformed key — an out-of-range month — rather than free
    // text. Node's non-ISO fallback parser is lenient enough to turn
    // `'not-a-month-01'` into a valid January 2001, so a garbage string is
    // not the case worth pinning; a bad month number, which is what a
    // hand-edited changelog entry would actually produce, is.
    expect(formatMonthHeading('2026-13')).toBe('2026-13');
    expect(formatMonthHeading('2026-13', 'sv')).toBe('2026-13');
  });
});

// Date-only strings (YYYY-MM-DD) parse as UTC midnight. Reading them back with
// a local-time getter rolls back a calendar day for any negative-UTC-offset
// viewer (all of the Americas), showing the wrong month and day (#160). These
// run under such a timezone, in both languages — a Swedish translation that
// reached for a local-time getter would fail here and nowhere else.
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
    expect(formatMonthHeading('2026-08', 'sv')).toBe('augusti 2026');
  });

  it('formatEventDateShort is not shifted back a day', () => {
    expect(formatEventDateShort('2026-08-01')).toBe('Sat 1 Aug');
    expect(formatEventDateShort('2026-08-01', 'sv')).toBe('lör 1 aug');
  });

  it('formatEventDateRange month names are not shifted back', () => {
    expect(formatEventDateRange('2026-08-01', '2026-08-02')).toBe('Sat 1 & Sun 2 Aug');
    expect(formatEventDateRange('2026-08-01', '2026-08-02', 'sv')).toBe('lör 1 & sön 2 aug');
  });

  it('formatCompactWeekdayDate is not shifted back a day', () => {
    expect(formatCompactWeekdayDate('2026-08-01')).toBe('Sat 1 Aug');
    expect(formatCompactWeekdayDate('2026-08-01', 'sv')).toBe('lör 1 aug');
  });
});

describe('formatCompactDateRange', () => {
  it('uses the weekday form for a single night', () => {
    expect(formatCompactDateRange(['2026-08-26'])).toBe('Wed 26 Aug');
    expect(formatCompactDateRange(['2026-08-26'], 'sv')).toBe('ons 26 aug');
  });

  it('collapses a same-month run to one month name', () => {
    expect(formatCompactDateRange(['2026-08-26', '2026-08-27'])).toBe('26–27 Aug');
    expect(formatCompactDateRange(['2026-08-26', '2026-08-27'], 'sv')).toBe('26–27 aug');
  });

  it('names both months across a boundary', () => {
    expect(formatCompactDateRange(['2026-08-30', '2026-09-01'])).toBe('30 Aug–1 Sep');
    expect(formatCompactDateRange(['2026-08-30', '2026-09-01'], 'sv')).toBe('30 aug–1 sep');
  });
});
