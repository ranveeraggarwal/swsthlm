import { describe, expect, it } from 'vitest';
import {
  ALL_VENUES,
  NO_FILTERS,
  emptyStateHeading,
  summariseFilters,
  venueFilterLabel,
  type EventFilters,
} from './sections';

// Only the Swedish branch of each function is asserted exactly here —
// `format.test.ts` established the pattern of exact-string assertions after
// `toContain` let two date formats drift from their own doc comments for
// months (#261). The English branch is covered by the byte-identical
// comparison in the S3 verification run, not duplicated here.

describe('venueFilterLabel', () => {
  it('translates the "no filter" sentinel in Swedish', () => {
    expect(venueFilterLabel(ALL_VENUES, 'sv')).toBe('Alla lokaler');
  });

  it('passes a real venue name through unchanged in either locale', () => {
    expect(venueFilterLabel('Nalen', 'sv')).toBe('Nalen');
  });
});

describe('emptyStateHeading', () => {
  const filters = (patch: Partial<EventFilters>): EventFilters => ({ ...NO_FILTERS, ...patch });

  it('names the style and venue in Swedish', () => {
    expect(
      emptyStateHeading(filters({ style: 'lindy-hop', venue: 'Nalen' }), 'sv'),
    ).toBe('Inga Lindy Hop-evenemang på Nalen just nu');
  });

  it('names only the style in Swedish', () => {
    expect(emptyStateHeading(filters({ style: 'balboa' }), 'sv')).toBe(
      'Inga Balboa-evenemang just nu',
    );
  });

  it('names only the venue in Swedish', () => {
    expect(emptyStateHeading(filters({ venue: 'Nalen' }), 'sv')).toBe(
      'Inga evenemang på Nalen just nu',
    );
  });

  it('falls back to the generic heading in Swedish', () => {
    expect(emptyStateHeading(NO_FILTERS, 'sv')).toBe('Inga evenemang matchar dina filter');
  });
});

describe('summariseFilters', () => {
  it('pluralises the Swedish noun (invariant, unlike English)', () => {
    const one = summariseFilters({ ...NO_FILTERS, style: 'blues' }, 1, 'sv');
    const many = summariseFilters({ ...NO_FILTERS, style: 'blues' }, 3, 'sv');
    expect(one).toEqual({ kind: 'filtered', description: '1 Blues evenemang' });
    expect(many).toEqual({ kind: 'filtered', description: '3 Blues evenemang' });
  });

  it('translates the live-music qualifier, venue clause and search clause in Swedish', () => {
    const summary = summariseFilters(
      { search: 'blues', style: 'balboa', venue: 'Nalen', liveMusicOnly: true },
      7,
      'sv',
    );
    expect(summary).toEqual({
      kind: 'filtered',
      description: '7 Balboa Livemusik evenemang på Nalen som matchar "blues"',
    });
  });
});
