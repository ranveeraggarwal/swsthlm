import { describe, it, expect } from 'vitest';
import { resolveOccurrence, computeExceptionChanges } from './exceptions.mjs';

const series = {
  rows: [{
    id: 'chicago-live-weds',
    venue_id: 'chicago',
    weekday: 'wednesday',
    start: '19:00',
    end: '23:00',
    music: 'live',
    dj: '',
    band: '',
    status: 'live',
    valid_from: '2026-06-03',
    valid_to: '2026-06-17',
  }],
};

describe('resolveOccurrence', () => {
  it('returns series defaults when no exception exists', () => {
    const r = resolveOccurrence('chicago-live-weds', '2026-06-17', series, { rows: [] });
    expect(r).toMatchObject({ music: 'live', dj: '', band: '', start: '19:00', end: '23:00' });
  });

  it('merges exception fields over series defaults', () => {
    const exceptions = {
      rows: [{
        series_id: 'chicago-live-weds', date: '2026-06-17',
        music: 'dj', dj: 'The Hot Shots', band: '', start: '', end: '',
      }],
    };
    const r = resolveOccurrence('chicago-live-weds', '2026-06-17', series, exceptions);
    expect(r).toMatchObject({ music: 'dj', dj: 'The Hot Shots', start: '19:00', end: '23:00' });
  });
});

describe('computeExceptionChanges', () => {
  it('detects music and dj changes', () => {
    const row = { music: 'dj', dj: 'The Hot Shots', band: '', start: '19:00', end: '23:00' };
    const resolved = { music: 'live', dj: '', band: '', start: '19:00', end: '23:00' };
    const changes = computeExceptionChanges(row, resolved);
    expect(changes).toContainEqual({ field: 'music', from: 'live', to: 'dj' });
    expect(changes).toContainEqual({ field: 'dj', from: '', to: 'The Hot Shots' });
    expect(changes).toHaveLength(2);
  });

  it('returns empty when candidate matches resolved', () => {
    const row = { music: 'live', dj: '', band: '', start: '19:00', end: '23:00' };
    const resolved = { music: 'live', dj: '', band: '', start: '19:00', end: '23:00' };
    expect(computeExceptionChanges(row, resolved)).toHaveLength(0);
  });

  it('ignores empty candidate fields (unknown ≠ blank)', () => {
    // Candidate doesn't know band; human added a live-band exception for this date.
    const row = { music: 'dj', dj: 'DJ Someone', band: '', start: '19:00', end: '23:00' };
    const resolved = { music: 'live', dj: '', band: 'Some Live Band', start: '19:00', end: '23:00' };
    const changes = computeExceptionChanges(row, resolved);
    expect(changes.map((c) => c.field)).not.toContain('band');
    expect(changes).toHaveLength(2); // music and dj only
  });
});
