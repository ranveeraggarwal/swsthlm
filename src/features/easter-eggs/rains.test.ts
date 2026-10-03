import { describe, expect, it } from 'vitest';
import { RAINS, rainFor } from './rains';

describe('rainFor', () => {
  it('finds kanelbulle on 4 October in any year', () => {
    expect(rainFor('2026-10-04')?.id).toBe('kanelbulle');
    expect(rainFor('2031-10-04')?.id).toBe('kanelbulle');
  });

  it('is null on the days either side', () => {
    expect(rainFor('2026-10-03')).toBeNull();
    expect(rainFor('2026-10-05')).toBeNull();
    expect(rainFor('2026-04-10')).toBeNull();
  });

  it('is null for malformed input', () => {
    expect(rainFor('')).toBeNull();
    expect(rainFor('10-04')).toBeNull();
  });

  it('lets a known ?rain= id force a rain on any day', () => {
    expect(rainFor('2026-03-01', 'kanelbulle')?.id).toBe('kanelbulle');
    expect(rainFor('2026-03-01', 'nonsense')).toBeNull();
    expect(rainFor('2026-10-04', 'nonsense')?.id).toBe('kanelbulle');
  });
});

describe('RAINS', () => {
  it('has well-formed, unique days', () => {
    const days = RAINS.map((rain) => rain.monthDay);
    for (const day of days) expect(day).toMatch(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
    expect(new Set(days).size).toBe(days.length);
  });
});
