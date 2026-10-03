import { describe, expect, it } from 'vitest';
import { isCinnamonBunDay } from './cinnamonBunDay';

describe('isCinnamonBunDay', () => {
  it('is true on 4 October in any year', () => {
    expect(isCinnamonBunDay('2026-10-04')).toBe(true);
    expect(isCinnamonBunDay('2031-10-04')).toBe(true);
  });

  it('is false on the days either side', () => {
    expect(isCinnamonBunDay('2026-10-03')).toBe(false);
    expect(isCinnamonBunDay('2026-10-05')).toBe(false);
    expect(isCinnamonBunDay('2026-04-10')).toBe(false);
  });

  it('is false for malformed input', () => {
    expect(isCinnamonBunDay('')).toBe(false);
    expect(isCinnamonBunDay('10-04')).toBe(false);
  });
});
