import { describe, expect, it } from 'vitest';
import { getTemporalBadge, isPastEvent, temporalBadgeLabel } from './temporal';

const today = '2025-05-20';
const yesterday = '2025-05-19';
const tomorrow = '2025-05-21';

/** `getTemporalBadge(timing, now, isThisWeek)`, spelled out for readability. */
const badgeFor = (
  date: string,
  start: string,
  end: string,
  nowTime: string,
  isThisWeek = true,
  nowDate = today,
) => getTemporalBadge({ date, start, end }, { date: nowDate, time: nowTime }, isThisWeek);

describe('getTemporalBadge', () => {
  it('returns "happening-now" when the event is currently active', () => {
    expect(badgeFor(today, '18:00', '22:00', '19:00')).toBe('happening-now');
    // Inclusive at both ends.
    expect(badgeFor(today, '18:00', '22:00', '18:00')).toBe('happening-now');
    expect(badgeFor(today, '18:00', '22:00', '22:00')).toBe('happening-now');
  });

  it('handles overnight events on both sides of midnight', () => {
    expect(badgeFor(today, '20:00', '01:00', '22:00')).toBe('happening-now');
    expect(badgeFor(today, '20:00', '01:00', '20:00')).toBe('happening-now');
    expect(badgeFor(today, '20:00', '01:00', '00:30')).toBe('happening-now');
  });

  it('stays "happening-now" the morning after an overnight event, until its end time', () => {
    // 20:00–01:00 on yesterday's date is still active at 00:45 today.
    expect(badgeFor(yesterday, '20:00', '01:00', '00:45', true, today)).toBe('happening-now');
    // Inclusive at the end time itself.
    expect(badgeFor(yesterday, '20:00', '01:00', '01:00', true, today)).toBe('happening-now');
  });

  it('returns "ended" once an overnight event\'s end time has passed the next morning', () => {
    expect(badgeFor(yesterday, '20:00', '01:00', '01:15', true, today)).toBe('ended');
  });

  it('returns "ended" when the event finished earlier today', () => {
    expect(badgeFor(today, '14:00', '17:00', '18:00')).toBe('ended');
  });

  it('returns "ended" for events on past dates', () => {
    expect(badgeFor('2025-05-19', '19:00', '22:00', '17:00')).toBe('ended');
    expect(badgeFor('2025-05-18', '19:00', '22:00', '17:00')).toBe('ended');
  });

  it('does NOT return "ended" for an overnight event that has not started', () => {
    // 20:00–01:00 at 19:00 is "tonight", not "ended" — its end time sorts before
    // its start, so a naive comparison would retire it before it began.
    expect(badgeFor(today, '20:00', '01:00', '19:00')).toBe('tonight');
  });

  it('returns "tonight" for events later today', () => {
    expect(badgeFor(today, '19:00', '22:00', '17:00')).toBe('tonight');
  });

  it('returns "tomorrow" for events on the next day', () => {
    expect(badgeFor(tomorrow, '19:00', '22:00', '17:00')).toBe('tomorrow');
  });

  it('returns "this-week" for other events in the same week', () => {
    expect(badgeFor('2025-05-22', '19:00', '22:00', '17:00')).toBe('this-week');
  });

  it('returns null for future events not in the current week', () => {
    expect(badgeFor('2025-05-30', '19:00', '22:00', '17:00', false)).toBe(null);
  });
});

describe('isPastEvent', () => {
  const timing = (date: string, start: string, end: string) => ({ date, start, end });

  it('is not past for today or future dates', () => {
    expect(isPastEvent(timing(today, '19:00', '22:00'), { date: today, time: '23:00' })).toBe(false);
    expect(isPastEvent(timing(tomorrow, '19:00', '22:00'), { date: today, time: '10:00' })).toBe(false);
  });

  it('is past for an ordinary event from a prior date', () => {
    expect(isPastEvent(timing(yesterday, '19:00', '22:00'), { date: today, time: '10:00' })).toBe(true);
  });

  it('is not past for an overnight event from yesterday that has not reached its end time', () => {
    expect(isPastEvent(timing(yesterday, '20:00', '01:00'), { date: today, time: '00:45' })).toBe(false);
    expect(isPastEvent(timing(yesterday, '20:00', '01:00'), { date: today, time: '01:00' })).toBe(false);
  });

  it('is past for an overnight event from yesterday once its end time has passed', () => {
    expect(isPastEvent(timing(yesterday, '20:00', '01:00'), { date: today, time: '01:15' })).toBe(true);
  });

  it('is past for an overnight event more than one day old, even before its end time', () => {
    expect(
      isPastEvent(timing('2025-05-18', '20:00', '01:00'), { date: today, time: '00:45' }),
    ).toBe(true);
  });
});

describe('temporalBadgeLabel', () => {
  it('defaults to English', () => {
    expect(temporalBadgeLabel('happening-now')).toBe('Happening Now');
    expect(temporalBadgeLabel('this-week')).toBe('This Week');
  });

  it('translates every badge kind in Swedish', () => {
    expect(temporalBadgeLabel('happening-now', 'sv')).toBe('Pågår nu');
    expect(temporalBadgeLabel('ended', 'sv')).toBe('Avslutad');
    expect(temporalBadgeLabel('tonight', 'sv')).toBe('Ikväll');
    expect(temporalBadgeLabel('tomorrow', 'sv')).toBe('Imorgon');
    expect(temporalBadgeLabel('this-week', 'sv')).toBe('Denna vecka');
  });
});
