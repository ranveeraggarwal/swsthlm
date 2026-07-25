import { describe, expect, it } from 'vitest';
import { formatMonthHeading } from '@/lib/date/format';
import { CHANGELOG } from './entries';

describe('CHANGELOG', () => {
  it('has at least one month', () => {
    expect(CHANGELOG.length).toBeGreaterThan(0);
  });

  it('uses YYYY-MM month keys that format into a readable heading', () => {
    for (const entry of CHANGELOG) {
      expect(entry.month).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      // A bad key would fall through formatMonthHeading unchanged.
      expect(formatMonthHeading(entry.month)).not.toBe(entry.month);
    }
  });

  it('lists months newest first, with no duplicates', () => {
    const months = CHANGELOG.map((entry) => entry.month);
    expect(months).toEqual([...months].sort().reverse());
    expect(new Set(months).size).toBe(months.length);
  });

  it('gives every month a summary and at least one item', () => {
    for (const entry of CHANGELOG) {
      expect(entry.summary.trim()).not.toBe('');
      expect(entry.items.length).toBeGreaterThan(0);
    }
  });

  it('gives every item a title and a description', () => {
    for (const entry of CHANGELOG) {
      for (const item of entry.items) {
        expect(item.title.trim()).not.toBe('');
        expect(item.description.trim()).not.toBe('');
      }
    }
  });

  it('keeps item titles unique within a month (they are React keys)', () => {
    for (const entry of CHANGELOG) {
      const titles = entry.items.map((item) => item.title);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });
});
