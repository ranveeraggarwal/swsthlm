import { describe, expect, it } from 'vitest';
import { getTemporalBadge, formatEventDateRange, isNextWeek, isSunday } from './datetime';

describe('getTemporalBadge', () => {
  const today = '2025-05-20';
  const tomorrow = '2025-05-21';

  it('returns "happening-now" when the event is currently active', () => {
    // Same-day event
    expect(getTemporalBadge(today, '18:00', '22:00', today, '19:00', true)).toBe('happening-now');
    expect(getTemporalBadge(today, '18:00', '22:00', today, '18:00', true)).toBe('happening-now');
    expect(getTemporalBadge(today, '18:00', '22:00', today, '22:00', true)).toBe('happening-now');

    // Overnight event
    expect(getTemporalBadge(today, '20:00', '01:00', today, '22:00', true)).toBe('happening-now');
    expect(getTemporalBadge(today, '20:00', '01:00', today, '20:00', true)).toBe('happening-now');
    expect(getTemporalBadge(today, '20:00', '01:00', today, '00:30', true)).toBe('happening-now');
  });

  it('returns "ended" when the event finished earlier today', () => {
    // Finished at 17:00, current time 18:00
    expect(getTemporalBadge(today, '14:00', '17:00', today, '18:00', true)).toBe('ended');
  });

  it('returns "ended" for events on past dates', () => {
    // Yesterday's event
    expect(getTemporalBadge('2025-05-19', '19:00', '22:00', today, '17:00', true)).toBe('ended');
    // Earlier in the week
    expect(getTemporalBadge('2025-05-18', '19:00', '22:00', today, '17:00', true)).toBe('ended');
  });

  it('does NOT return "ended" for overnight events that have not passed midnight', () => {
    // 20:00 - 01:00 event, at 22:00 today. It is "happening-now".
    expect(getTemporalBadge(today, '20:00', '01:00', today, '22:00', true)).toBe('happening-now');

    // 20:00 - 01:00 event, at 19:00 today. It is "tonight".
    expect(getTemporalBadge(today, '20:00', '01:00', today, '19:00', true)).toBe('tonight');
  });

  it('returns "tonight" for events later today', () => {
    expect(getTemporalBadge(today, '19:00', '22:00', today, '17:00', true)).toBe('tonight');
  });

  it('returns "tomorrow" for events on the next day', () => {
    expect(getTemporalBadge(tomorrow, '19:00', '22:00', today, '17:00', true)).toBe('tomorrow');
  });

  it('returns "this-week" for other events in the same week', () => {
    // Not today (20th), not tomorrow (21st), but marked as this week
    expect(getTemporalBadge('2025-05-22', '19:00', '22:00', today, '17:00', true)).toBe('this-week');
  });

  it('returns null for future events not in the current week', () => {
    expect(getTemporalBadge('2025-05-30', '19:00', '22:00', today, '17:00', false)).toBe(null);
  });
});

describe('isNextWeek', () => {
  // 2025-05-19 is a Monday
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
    const sunday = '2025-05-25'; // Sunday
    // Next week from Sunday = Mon May 26 – Sun Jun 1
    expect(isNextWeek('2025-05-26', sunday)).toBe(true);
    expect(isNextWeek('2025-06-01', sunday)).toBe(true);
    expect(isNextWeek('2025-06-02', sunday)).toBe(false);
  });
});

describe('isSunday', () => {
  it('returns true for Sundays', () => {
    expect(isSunday('2025-05-25')).toBe(true); // a Sunday
    expect(isSunday('2026-06-21')).toBe(true); // a Sunday
  });

  it('returns false for other days', () => {
    expect(isSunday('2025-05-19')).toBe(false); // Monday
    expect(isSunday('2025-05-24')).toBe(false); // Saturday
  });
});

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
