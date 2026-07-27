import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from './relative';

const NOW = Date.parse('2026-07-27T12:00:00Z');
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** An ISO timestamp `ms` milliseconds before `NOW`. */
const ago = (ms: number) => new Date(NOW - ms).toISOString();

describe('formatRelativeTime — English', () => {
  it('says "just now" under a minute, and for a future timestamp', () => {
    expect(formatRelativeTime(ago(0), NOW)).toBe('just now');
    expect(formatRelativeTime(ago(30_000), NOW)).toBe('just now');
    // Clock skew between the build machine and the visitor's browser can put
    // the data timestamp in the future; that must not render "-1 minutes ago".
    expect(formatRelativeTime(ago(-5 * MINUTE), NOW)).toBe('just now');
  });

  it('inflects each unit at 1 and at 2+', () => {
    expect(formatRelativeTime(ago(MINUTE), NOW)).toBe('1 minute ago');
    expect(formatRelativeTime(ago(2 * MINUTE), NOW)).toBe('2 minutes ago');
    expect(formatRelativeTime(ago(HOUR), NOW)).toBe('1 hour ago');
    expect(formatRelativeTime(ago(2 * HOUR), NOW)).toBe('2 hours ago');
    expect(formatRelativeTime(ago(DAY), NOW)).toBe('1 day ago');
    expect(formatRelativeTime(ago(2 * DAY), NOW)).toBe('2 days ago');
    expect(formatRelativeTime(ago(7 * DAY), NOW)).toBe('1 week ago');
    expect(formatRelativeTime(ago(14 * DAY), NOW)).toBe('2 weeks ago');
  });

  it('defaults to English when no locale is passed', () => {
    expect(formatRelativeTime(ago(2 * HOUR), NOW)).toBe(formatRelativeTime(ago(2 * HOUR), NOW, 'en'));
  });
});

describe('formatRelativeTime — Swedish', () => {
  it('says "nyss" under a minute, and for a future timestamp', () => {
    expect(formatRelativeTime(ago(30_000), NOW, 'sv')).toBe('nyss');
    expect(formatRelativeTime(ago(-5 * MINUTE), NOW, 'sv')).toBe('nyss');
  });

  // Swedish plurals are not a suffix rule — each unit inflects differently
  // (minut/minuter, timme/timmar, dag/dagar, vecka/veckor), which is the whole
  // reason the English `+ 's'` had to become a per-locale table.
  it('inflects each unit at 1 and at 2+', () => {
    expect(formatRelativeTime(ago(MINUTE), NOW, 'sv')).toBe('1 minut sedan');
    expect(formatRelativeTime(ago(2 * MINUTE), NOW, 'sv')).toBe('2 minuter sedan');
    expect(formatRelativeTime(ago(HOUR), NOW, 'sv')).toBe('1 timme sedan');
    expect(formatRelativeTime(ago(2 * HOUR), NOW, 'sv')).toBe('2 timmar sedan');
    expect(formatRelativeTime(ago(DAY), NOW, 'sv')).toBe('1 dag sedan');
    expect(formatRelativeTime(ago(2 * DAY), NOW, 'sv')).toBe('2 dagar sedan');
    expect(formatRelativeTime(ago(7 * DAY), NOW, 'sv')).toBe('1 vecka sedan');
    expect(formatRelativeTime(ago(14 * DAY), NOW, 'sv')).toBe('2 veckor sedan');
  });

  it('never uses the English plural "-er"/"-ar" on the wrong unit', () => {
    // A plausible bug: reusing one plural suffix for every noun. Pin the two
    // that differ most.
    expect(formatRelativeTime(ago(3 * HOUR), NOW, 'sv')).not.toContain('timmer');
    expect(formatRelativeTime(ago(3 * DAY), NOW, 'sv')).not.toContain('dager');
  });
});

describe('formatRelativeTime — unit boundaries', () => {
  // Each unit hands over to the next at its own threshold; off-by-ones here
  // read as "60 minutes ago" or "0 hours ago".
  it('rolls over at 60 minutes, 24 hours and 7 days', () => {
    expect(formatRelativeTime(ago(59 * MINUTE), NOW, 'sv')).toBe('59 minuter sedan');
    expect(formatRelativeTime(ago(60 * MINUTE), NOW, 'sv')).toBe('1 timme sedan');
    expect(formatRelativeTime(ago(23 * HOUR), NOW, 'sv')).toBe('23 timmar sedan');
    expect(formatRelativeTime(ago(24 * HOUR), NOW, 'sv')).toBe('1 dag sedan');
    expect(formatRelativeTime(ago(6 * DAY), NOW, 'sv')).toBe('6 dagar sedan');
    expect(formatRelativeTime(ago(7 * DAY), NOW, 'sv')).toBe('1 vecka sedan');
  });

  it('keeps counting in weeks rather than falling back to months', () => {
    expect(formatRelativeTime(ago(70 * DAY), NOW, 'sv')).toBe('10 veckor sedan');
  });

  it('degrades to "just now" for an unparseable timestamp', () => {
    // The value comes from NEXT_PUBLIC_DATA_UPDATED_AT; a malformed one used
    // to render "NaN weeks ago" in the footer.
    expect(formatRelativeTime('not-a-timestamp', NOW)).toBe('just now');
    expect(formatRelativeTime('not-a-timestamp', NOW, 'sv')).toBe('nyss');
  });
});

// This module must stay host-independent for the same reason `format.ts` does:
// its output can differ between the server and the browser only if something
// locale- or timezone-sensitive creeps in.
describe('formatRelativeTime is timezone-independent', () => {
  const originalTz = process.env.TZ;

  for (const tz of [
    'Europe/Stockholm',
    'UTC',
    'America/Los_Angeles',
    'America/New_York',
    'Pacific/Kiritimati',
  ]) {
    it(`holds under TZ=${tz}`, () => {
      process.env.TZ = tz;
      try {
        expect(formatRelativeTime(ago(2 * HOUR), NOW, 'sv')).toBe('2 timmar sedan');
        expect(formatRelativeTime(ago(3 * DAY), NOW)).toBe('3 days ago');
      } finally {
        process.env.TZ = originalTz;
      }
    });
  }
});
