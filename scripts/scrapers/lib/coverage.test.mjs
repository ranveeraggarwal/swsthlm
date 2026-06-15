import { describe, it, expect } from 'vitest';
import { buildCoverage } from './coverage.mjs';

describe('buildCoverage', () => {
  const mockSeries = {
    rows: [
      {
        id: 'chicago-live-weds',
        venue_id: 'chicago',
        weekday: 'wednesday',
        valid_from: '2026-06-03',
        valid_to: '2026-06-17',
        status: 'live',
      },
      {
        id: 'zinkens-rhythm-club',
        venue_id: 'chicago',
        weekday: 'thursday',
        valid_from: '2026-06-04',
        valid_to: '2026-06-17',
        status: 'live',
      },
    ],
  };

  const mockOneoffs = {
    rows: [
      {
        venue_id: 'staclara',
        date: '2026-06-01',
        end_date: '2026-06-03',
        status: 'live',
      },
    ],
  };

  const coverage = buildCoverage(mockOneoffs, mockSeries);

  it('covers Wednesday within the live-weds window', () => {
    expect(coverage.has('chicago', '2026-06-10')).toBe(true); // Wednesday
    expect(coverage.has('chicago', '2026-06-17')).toBe(true); // Wednesday (last day)
  });

  it('covers Thursday within Zinken window', () => {
    expect(coverage.has('chicago', '2026-06-11')).toBe(true); // Thursday
  });

  it('does NOT cover Saturday (no Chicago series on Saturdays)', () => {
    expect(coverage.has('chicago', '2026-06-13')).toBe(false); // Saturday
  });

  it('does NOT cover Wednesday AFTER valid_to (series expired)', () => {
    expect(coverage.has('chicago', '2026-06-24')).toBe(false); // Wednesday
  });

  it('does NOT cover a different venue for the same date', () => {
    expect(coverage.has('staclara', '2026-06-10')).toBe(false);
  });

  it('covers every date in a one-off multi-day range', () => {
    expect(coverage.has('staclara', '2026-06-01')).toBe(true);
    expect(coverage.has('staclara', '2026-06-02')).toBe(true);
    expect(coverage.has('staclara', '2026-06-03')).toBe(true);
  });

  it('does NOT cover day after a one-off multi-day range', () => {
    expect(coverage.has('staclara', '2026-06-04')).toBe(false);
  });
});
