import { describe, it, expect } from 'vitest';
import { ONEOFF_FIELDS, computeRowUpdate } from './candidate.mjs';

const blank = () => Object.fromEntries(ONEOFF_FIELDS.map((f) => [f, '']));

// The row as a human curated it: price, ticket URL and blurb filled in by hand
// on top of what the scraper originally proposed.
const curated = {
  ...blank(),
  id: 'chicago-2026-09-26',
  name: 'Chicago Live Saturdays - TBA',
  style: 'all',
  venue_id: 'chicago',
  date: '2026-09-26',
  start: '21:00',
  end: '00:00',
  price: '250 kr (200 kr för rabatterade)',
  music: 'live',
  organizer: 'Chicago Swing Dance Studio',
  url: 'https://www.biljettkiosken.se/event/260926-chicago-livesaturdays',
  description: 'Vanligen sista lördagen i månaden arrangeras swingdanskväll på Chicago.',
  status: 'live',
};

describe('computeRowUpdate', () => {
  it('reports no change when the scrape adds nothing new', () => {
    const { changedFields } = computeRowUpdate(curated, { ...curated });
    expect(changedFields).toEqual([]);
  });

  it('never proposes blanking a field the scraper did not read', () => {
    const scraped = { ...curated, price: '', description: '' };
    const { changedFields, merged } = computeRowUpdate(curated, scraped);

    expect(changedFields).toEqual([]);
    expect(merged.price).toBe(curated.price);
    expect(merged.description).toBe(curated.description);
  });

  // The exact shape of the bug behind PR #376: the Chicago parser read no
  // price and no description, and the runner wrote the rebuilt row wholesale,
  // erasing both.
  it('leaves the whole curated row intact when the parser reads nothing extra', () => {
    const scraped = { ...blank(), ...{
      id: curated.id,
      name: curated.name,
      style: 'all',
      venue_id: 'chicago',
      date: curated.date,
      start: '21:00',
      end: '00:00',
      music: 'live',
      organizer: curated.organizer,
      url: curated.url,
      status: 'live',
    } };
    const { changedFields, merged } = computeRowUpdate(curated, scraped);

    expect(changedFields).toEqual([]);
    for (const f of ONEOFF_FIELDS) expect(merged[f]).toBe(curated[f]);
  });

  it('proposes a field the scraper newly learned', () => {
    const scraped = { ...curated, band: 'Hot Club de Stockholm' };
    const { changedFields, merged, changes } = computeRowUpdate(curated, scraped);

    expect(changedFields).toEqual(['band']);
    expect(merged.band).toBe('Hot Club de Stockholm');
    expect(changes[0]).toContain('band');
  });

  it('proposes a genuine disagreement between two non-empty values', () => {
    const scraped = { ...curated, price: '300 kr' };
    const { changedFields, merged } = computeRowUpdate(curated, scraped);

    expect(changedFields).toEqual(['price']);
    expect(merged.price).toBe('300 kr');
  });

  it('carries every untouched field through unchanged', () => {
    const scraped = { ...curated, band: 'Hot Club de Stockholm' };
    const { merged } = computeRowUpdate(curated, scraped);

    for (const f of ONEOFF_FIELDS.filter((x) => x !== 'band')) {
      expect(merged[f]).toBe(curated[f]);
    }
  });

  // Documents a known gap rather than asserting desired behaviour: a non-empty
  // scraped URL still wins over a curated ticket link, so the venue's own event
  // page keeps getting re-proposed. Deciding URL precedence is a separate call.
  it('still proposes its own URL over a curated ticket link', () => {
    const scraped = { ...curated, url: 'https://www.chicago75.se/evenemang/x' };
    const { changedFields } = computeRowUpdate(curated, scraped);

    expect(changedFields).toEqual(['url']);
  });
});
