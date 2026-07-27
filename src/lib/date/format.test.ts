import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  formatCompactDateRange,
  formatCompactWeekdayDate,
  formatEventDate,
  formatEventDateRange,
  formatEventDateShort,
  formatMonthHeading,
} from './format';

// The five host timezones every timezone-sensitive suite in this repo pins:
// the audience, the build server, the two US offsets where #160 showed, and
// the far side of the date line. Mirrors `calendar.test.ts`'s list.
const HOST_TIMEZONES = [
  'Europe/Stockholm', // the audience
  'UTC', // the build server
  'America/Los_Angeles', // UTC-7/-8 — where the bug showed
  'America/New_York', // UTC-4/-5
  'Pacific/Kiritimati', // UTC+14, the far side
];

describe('formatEventDateRange', () => {
  it('returns single-date format when both dates are equal', () => {
    // Falls back to formatEventDate; result contains "Fri" and "Aug" for 2026-08-28.
    const result = formatEventDateRange('2026-08-28', '2026-08-28');
    expect(result).toContain('Aug');
    expect(result).toContain('28');
  });

  it('formats same-month range with one shared month abbreviation', () => {
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
    expect(formatCompactWeekdayDate('not-a-date', 'sv')).toBe('not-a-date');
  });
});

// Date-only strings (YYYY-MM-DD) parse as UTC midnight. Reading them back with
// local-time getters (or formatting with no explicit timeZone) rolls back a
// calendar day for any negative-UTC-offset viewer (all of the Americas),
// showing the wrong month/day. These pin the fix under such a timezone.
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
    expect(formatCompactDateRange(['2026-08-26', '2026-08-27'])).toBe('26–27 Aug');
  });

  it('names both months across a boundary', () => {
    expect(formatCompactDateRange(['2026-08-30', '2026-09-01'])).toBe('30 Aug–1 Sep');
  });
});

// ---------------------------------------------------------------------------
// English output is frozen (#261)
// ---------------------------------------------------------------------------

// Adding Swedish meant replacing `toLocaleDateString` with fixed arrays for
// *both* locales, so that no path in this file touches Intl. These pin the
// exact English strings the Intl implementation produced (verified against
// both Node's and Chromium's ICU before the swap), so the refactor is provably
// output-neutral for the English site. The loose `toContain` assertions above
// would not have caught a reordering.
describe('English output is unchanged by the move off Intl', () => {
  it('pins every format exactly', () => {
    expect(formatCompactWeekdayDate('2026-06-24')).toBe('Wed 24 Jun');
    expect(formatMonthHeading('2026-06')).toBe('June 2026');
    expect(formatEventDateShort('2026-06-24')).toBe('Wed, Jun 24');
    expect(formatEventDate('2026-06-24')).toBe('Wednesday, Jun 24');
    expect(formatEventDateRange('2026-08-28', '2026-08-29')).toBe('28 Fri & 29 Sat Aug');
    expect(formatEventDateRange('2026-07-31', '2026-08-01')).toBe('31 Fri Jul & 1 Sat Aug');
    expect(formatCompactDateRange(['2026-08-26', '2026-08-27'])).toBe('26–27 Aug');
  });

  it('defaults to English when no locale is passed', () => {
    // Every call site outside this PR still calls these with one argument;
    // the default must keep them on the English strings.
    expect(formatEventDate('2026-06-24')).toBe(formatEventDate('2026-06-24', 'en'));
    expect(formatCompactDateRange(['2026-08-26', '2026-08-27']))
      .toBe(formatCompactDateRange(['2026-08-26', '2026-08-27'], 'en'));
  });
});

// ---------------------------------------------------------------------------
// Swedish (#261)
// ---------------------------------------------------------------------------

describe('Swedish formatting', () => {
  it('formatCompactWeekdayDate is "ons 26 aug" — lowercase, no comma', () => {
    const result = formatCompactWeekdayDate('2026-08-26', 'sv');
    expect(result).toBe('ons 26 aug');
    expect(result).not.toContain(',');
  });

  it('formatMonthHeading is "augusti 2026" — lowercase month, no comma', () => {
    expect(formatMonthHeading('2026-08', 'sv')).toBe('augusti 2026');
  });

  it('formatEventDateShort is "ons 24 jun"', () => {
    expect(formatEventDateShort('2026-06-24', 'sv')).toBe('ons 24 jun');
  });

  it('formatEventDate is "onsdag 24 juni" — weekday, day, month, no comma', () => {
    // The word order differs from English ("Wednesday, Jun 24"): Swedish puts
    // the day before the month and drops the comma entirely. This is the
    // assertion that fails if someone "simplifies" the per-locale templates
    // back into one shared template fed different word arrays.
    const result = formatEventDate('2026-06-24', 'sv');
    expect(result).toBe('onsdag 24 juni');
    expect(result).not.toContain(',');
  });

  it('formatEventDateRange keeps "&" and one shared month within a month', () => {
    expect(formatEventDateRange('2026-08-28', '2026-08-29', 'sv')).toBe('fre 28 & lör 29 aug');
  });

  it('formatEventDateRange names both months across a boundary', () => {
    expect(formatEventDateRange('2026-07-31', '2026-08-01', 'sv')).toBe('fre 31 jul & lör 1 aug');
  });

  it('formatEventDateRange falls back to the single-date form for one night', () => {
    expect(formatEventDateRange('2026-08-28', '2026-08-28', 'sv')).toBe('fredag 28 augusti');
  });

  it('formatCompactDateRange matches the English shape with lowercase months', () => {
    expect(formatCompactDateRange(['2026-08-26'], 'sv')).toBe('ons 26 aug');
    expect(formatCompactDateRange(['2026-08-26', '2026-08-27'], 'sv')).toBe('26–27 aug');
    expect(formatCompactDateRange(['2026-08-30', '2026-09-01'], 'sv')).toBe('30 aug–1 sep');
  });

  it('never capitalises a weekday or month', () => {
    // Swedish lowercases these even at the start of a heading. Sweep the whole
    // year so a stray capital in one array entry can't hide.
    for (let month = 1; month <= 12; month += 1) {
      const key = `2026-${String(month).padStart(2, '0')}`;
      expect(formatMonthHeading(key, 'sv')).toBe(formatMonthHeading(key, 'sv').toLowerCase());
      for (let day = 1; day <= 28; day += 1) {
        const date = `${key}-${String(day).padStart(2, '0')}`;
        expect(formatEventDate(date, 'sv')).toBe(formatEventDate(date, 'sv').toLowerCase());
        expect(formatCompactWeekdayDate(date, 'sv'))
          .toBe(formatCompactWeekdayDate(date, 'sv').toLowerCase());
      }
    }
  });

  it('never emits Intl-style punctuation', () => {
    // `sv-SE` Intl renders "ons 24 juni" but also emits numeric forms like
    // "2026-06-24" for other option sets, and its punctuation is not pinned
    // across ICU builds. Nothing in the Swedish path may contain a comma or a
    // full ISO date.
    const samples = ['2026-01-04', '2026-06-24', '2026-12-31'];
    for (const date of samples) {
      for (const fn of [formatCompactWeekdayDate, formatEventDate, formatEventDateShort]) {
        expect(fn(date, 'sv')).not.toContain(',');
        expect(fn(date, 'sv')).not.toContain('2026-');
      }
    }
  });
});

// The whole point of the fixed arrays: identical bytes on every host. These run
// the Swedish formats under all five timezones and assert exact equality, so a
// day-shift (#160) or a punctuation drift (#200) fails loudly rather than
// showing up as a hydration warning in production.
describe('Swedish formatting is timezone-independent', () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTz;
  });

  // Each case is a date that has historically been able to shift: the first of
  // a month (the #160 shape), a leap day, both Europe/Stockholm DST
  // transitions, and the year boundary.
  const assertions = () => {
    // First of a month — rolls back into the previous month when read locally.
    expect(formatCompactWeekdayDate('2026-08-01', 'sv')).toBe('lör 1 aug');
    expect(formatEventDate('2026-08-01', 'sv')).toBe('lördag 1 augusti');
    expect(formatMonthHeading('2026-08', 'sv')).toBe('augusti 2026');

    // Leap day, and the day before it.
    expect(formatCompactWeekdayDate('2028-02-29', 'sv')).toBe('tis 29 feb');
    expect(formatEventDate('2028-02-29', 'sv')).toBe('tisdag 29 februari');
    expect(formatEventDateRange('2028-02-28', '2028-02-29', 'sv')).toBe('mån 28 & tis 29 feb');

    // Europe/Stockholm DST starts 2026-03-29 (CET → CEST, clocks jump 02:00 →
    // 03:00). A UTC-midnight date on the transition day is exactly where a
    // local-time read goes wrong.
    expect(formatCompactWeekdayDate('2026-03-29', 'sv')).toBe('sön 29 mar');
    expect(formatEventDateRange('2026-03-28', '2026-03-29', 'sv')).toBe('lör 28 & sön 29 mar');

    // …and ends 2026-10-25 (CEST → CET).
    expect(formatCompactWeekdayDate('2026-10-25', 'sv')).toBe('sön 25 okt');
    expect(formatEventDateRange('2026-10-24', '2026-10-25', 'sv')).toBe('lör 24 & sön 25 okt');

    // Month and year rollover in one step.
    expect(formatEventDateRange('2026-12-31', '2027-01-01', 'sv')).toBe('tor 31 dec & fre 1 jan');
    expect(formatCompactDateRange(['2026-12-31', '2027-01-01'], 'sv')).toBe('31 dec–1 jan');
    expect(formatMonthHeading('2027-01', 'sv')).toBe('januari 2027');
    expect(formatEventDate('2027-01-01', 'sv')).toBe('fredag 1 januari');
  };

  for (const tz of HOST_TIMEZONES) {
    it(`holds under TZ=${tz}`, () => {
      process.env.TZ = tz;
      assertions();
    });
  }
});

// The English equivalents of the same edge cases, under the same five zones —
// Swedish should not be the only locale with leap-day and DST coverage.
describe('English formatting is timezone-independent', () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTz;
  });

  const assertions = () => {
    expect(formatCompactWeekdayDate('2026-08-01')).toBe('Sat 1 Aug');
    expect(formatEventDate('2026-08-01')).toBe('Saturday, Aug 1');
    expect(formatMonthHeading('2026-08')).toBe('August 2026');
    expect(formatCompactWeekdayDate('2028-02-29')).toBe('Tue 29 Feb');
    expect(formatCompactWeekdayDate('2026-03-29')).toBe('Sun 29 Mar');
    expect(formatCompactWeekdayDate('2026-10-25')).toBe('Sun 25 Oct');
    expect(formatCompactDateRange(['2026-12-31', '2027-01-01'])).toBe('31 Dec–1 Jan');
    expect(formatMonthHeading('2027-01')).toBe('January 2027');
  };

  for (const tz of HOST_TIMEZONES) {
    it(`holds under TZ=${tz}`, () => {
      process.env.TZ = tz;
      assertions();
    });
  }
});
