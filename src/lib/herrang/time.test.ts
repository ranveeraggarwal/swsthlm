import { describe, it, expect } from 'vitest';
import {
  clockStateFor,
  endsChip,
  fromPosterMinutes,
  isNightGround,
  modeFor,
  relativeChip,
  toMinutes,
  toPosterMinutes,
} from './time';

const at = (iso: string) => new Date(iso); // device-local, like the client

describe('modeFor — the three clocks', () => {
  it('08:00–19:10 is day', () => {
    expect(modeFor(toMinutes('08:00'))).toBe('day');
    expect(modeFor(toMinutes('14:30'))).toBe('day');
    expect(modeFor(toMinutes('19:09'))).toBe('day');
  });
  it('19:10–04:00 is night', () => {
    expect(modeFor(toMinutes('19:10'))).toBe('night');
    expect(modeFor(toMinutes('23:59'))).toBe('night');
    expect(modeFor(toMinutes('00:00'))).toBe('night');
    expect(modeFor(toMinutes('03:59'))).toBe('night');
  });
  it('04:00–08:00 is the weird hours', () => {
    expect(modeFor(toMinutes('04:00'))).toBe('weird');
    expect(modeFor(toMinutes('07:59'))).toBe('weird');
  });
});

describe('poster timeline — cross-midnight', () => {
  it('times before 08:00 land past midnight on the poster date', () => {
    expect(toPosterMinutes('02:00')).toBe((24 + 2) * 60);
    expect(toPosterMinutes('22:15')).toBe(toMinutes('22:15'));
    expect(toPosterMinutes('08:00')).toBe(toMinutes('08:00'));
  });

  it('at 02:00 on the 12th, the poster date is still the 11th', () => {
    const clock = clockStateFor(at('2026-07-12T02:00:00'));
    expect(clock.dateISO).toBe('2026-07-12');
    expect(clock.posterDate).toBe('2026-07-11');
    expect(clock.posterMinutes).toBe((24 + 2) * 60);
    expect(clock.mode).toBe('night');
  });

  it('at 09:00 the poster date is today', () => {
    const clock = clockStateFor(at('2026-07-12T09:00:00'));
    expect(clock.posterDate).toBe('2026-07-12');
    expect(clock.posterMinutes).toBe(toMinutes('09:00'));
    expect(clock.mode).toBe('day');
  });

  it('a 02:00 poster slot reads as "Now" at 02:30 real time next day', () => {
    const clock = clockStateFor(at('2026-07-12T02:30:00'));
    const startPM = toPosterMinutes('02:00');
    const endPM = toPosterMinutes('04:00');
    expect(relativeChip(clock.posterMinutes, startPM, endPM)).toBe('Now');
  });
});

describe('night ground auto-invert', () => {
  it('flips at 20:00 and back at 08:00', () => {
    expect(isNightGround(toMinutes('19:59'))).toBe(false);
    expect(isNightGround(toMinutes('20:00'))).toBe(true);
    expect(isNightGround(toMinutes('03:00'))).toBe(true);
    expect(isNightGround(toMinutes('07:59'))).toBe(true);
    expect(isNightGround(toMinutes('08:00'))).toBe(false);
  });
});

describe('chips', () => {
  const now = toMinutes('21:20');
  it('speaks the main-site vocabulary', () => {
    expect(relativeChip(now, toMinutes('22:00'))).toBe('in 40 min');
    expect(relativeChip(now, toMinutes('23:20'))).toBe('in 2 h');
    expect(relativeChip(now, toMinutes('23:35'))).toBe('in 2 h 15 min');
    expect(relativeChip(now, toMinutes('21:00'), toMinutes('22:00'))).toBe('Now');
    expect(relativeChip(now, toMinutes('20:00'), toMinutes('21:00'))).toBe('ended 21:00');
  });
  it('formats running-event endings', () => {
    expect(endsChip(toMinutes('21:35'), toMinutes('22:00'))).toBe('ends in 25 min');
    expect(endsChip(toMinutes('21:00'), toPosterMinutes('01:45'))).toBe('ends 01:45');
    expect(endsChip(toMinutes('21:00'), undefined, true)).toBe('until ?');
  });
});

describe('fromPosterMinutes', () => {
  it('wraps past midnight', () => {
    expect(fromPosterMinutes(toPosterMinutes('01:45'))).toBe('01:45');
    expect(fromPosterMinutes(toMinutes('22:15'))).toBe('22:15');
  });
});
