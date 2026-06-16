import { describe, expect, it } from 'vitest';
import { getTemporalBadge, formatEventDateRange } from './datetime';

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

  it('returns "just-ended" when the event finished earlier today', () => {
    // Finished at 17:00, current time 18:00
    expect(getTemporalBadge(today, '14:00', '17:00', today, '18:00', true)).toBe('just-ended');
  });

  it('does NOT return "just-ended" for overnight events that have not passed midnight', () => {
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
