// The prose `sections.ts` produces, in both locales. The filtering and
// bucketing logic is covered where it is exercised end-to-end; what is easy to
// get wrong here is the wording — Swedish compounds a qualifier onto the noun
// ("Lindy Hop-evenemang") and has one form of "evenemang" for any count.

import { describe, expect, it } from 'vitest';
import {
  NO_FILTERS,
  emptyStateHeading,
  summariseFilters,
  venueFilterLabel,
  type EventFilters,
} from './sections';

const filtersWith = (patch: Partial<EventFilters>): EventFilters => ({
  ...NO_FILTERS,
  ...patch,
});

describe('venueFilterLabel', () => {
  it('translates the "no filter" option', () => {
    expect(venueFilterLabel('all', 'en')).toBe('All Venues');
    expect(venueFilterLabel('all', 'sv')).toBe('Alla lokaler');
  });

  it('passes a real venue name through untouched — it is data, not chrome', () => {
    expect(venueFilterLabel('Chicago Swing Dance Studio', 'en')).toBe(
      'Chicago Swing Dance Studio',
    );
    expect(venueFilterLabel('Chicago Swing Dance Studio', 'sv')).toBe(
      'Chicago Swing Dance Studio',
    );
  });
});

describe('emptyStateHeading', () => {
  it('names both filters when both are set', () => {
    const filters = filtersWith({ style: 'lindy-hop', venue: 'Bar Brooklyn' });
    expect(emptyStateHeading(filters, 'en')).toBe(
      'No Lindy Hop events at Bar Brooklyn right now',
    );
    expect(emptyStateHeading(filters, 'sv')).toBe(
      'Inga Lindy Hop-evenemang på Bar Brooklyn just nu',
    );
  });

  it('names the style alone', () => {
    const filters = filtersWith({ style: 'balboa' });
    expect(emptyStateHeading(filters, 'en')).toBe('No Balboa events right now');
    expect(emptyStateHeading(filters, 'sv')).toBe('Inga Balboa-evenemang just nu');
  });

  it('names the venue alone', () => {
    const filters = filtersWith({ venue: 'Scalateatern' });
    expect(emptyStateHeading(filters, 'en')).toBe('No events at Scalateatern right now');
    expect(emptyStateHeading(filters, 'sv')).toBe('Inga evenemang på Scalateatern just nu');
  });

  it('falls back to the generic sentence for a search-only or empty filter set', () => {
    const filters = filtersWith({ search: 'herräng' });
    expect(emptyStateHeading(filters, 'en')).toBe('No events match your filters');
    expect(emptyStateHeading(filters, 'sv')).toBe('Inga evenemang matchar dina filter');
  });
});

describe('summariseFilters', () => {
  it('returns the plain count when nothing is filtered, in either locale', () => {
    // No prose to translate in this branch — the component bolds the number.
    expect(summariseFilters(NO_FILTERS, 12, 'en')).toEqual({ kind: 'all', count: 12 });
    expect(summariseFilters(NO_FILTERS, 12, 'sv')).toEqual({ kind: 'all', count: 12 });
  });

  it('describes a style filter', () => {
    const filters = filtersWith({ style: 'lindy-hop' });
    expect(summariseFilters(filters, 3, 'en')).toEqual({
      kind: 'filtered',
      description: '3 Lindy Hop events',
    });
    expect(summariseFilters(filters, 3, 'sv')).toEqual({
      kind: 'filtered',
      description: '3 Lindy Hop-evenemang',
    });
  });

  it('pluralises in English; Swedish "evenemang" is the same either way', () => {
    const filters = filtersWith({ liveMusicOnly: true });
    expect(summariseFilters(filters, 1, 'en')).toEqual({
      kind: 'filtered',
      description: '1 Live Music event',
    });
    expect(summariseFilters(filters, 2, 'en')).toEqual({
      kind: 'filtered',
      description: '2 Live Music events',
    });
    expect(summariseFilters(filters, 1, 'sv')).toEqual({
      kind: 'filtered',
      description: '1 Livemusik-evenemang',
    });
    expect(summariseFilters(filters, 2, 'sv')).toEqual({
      kind: 'filtered',
      description: '2 Livemusik-evenemang',
    });
  });

  it('appends the venue and the search term', () => {
    const filters = filtersWith({ venue: 'Chicago', search: 'balboa' });
    expect(summariseFilters(filters, 4, 'en')).toEqual({
      kind: 'filtered',
      description: '4 events at Chicago matching "balboa"',
    });
    expect(summariseFilters(filters, 4, 'sv')).toEqual({
      kind: 'filtered',
      description: '4 evenemang på Chicago som matchar ”balboa”',
    });
  });
});
