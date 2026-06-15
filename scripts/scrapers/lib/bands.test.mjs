import { describe, it, expect } from 'vitest';
import { normalizeBand, slugifyBand, similarity, classify } from './bands.mjs';

// A small stand-in roster (not the real file) so the test is self-contained.
const roster = [
  { id: 'tommy-lobel-swing-band', name: 'Tommy Löbel Swing Band', aliases: ['Tommy Löbel', 'Tommy Lobel'], swing: 'yes' },
  { id: 'bandwagon-swing-orchestra', name: 'The Bandwagon Swing Orchestra', aliases: ['Bandwagon'], swing: 'yes' },
  { id: 'webop-kvintett', name: 'Webop Kvintett', aliases: [], swing: 'no' },
  { id: 'mellow', name: 'Mellow', aliases: [], swing: 'unknown' },
];

describe('normalizeBand', () => {
  it('strips diacritics, punctuation, and ensemble nouns', () => {
    expect(normalizeBand('Tommy Löbel Swing Band')).toBe('tommy lobel swing');
    expect(normalizeBand('Webop Kvintett')).toBe('webop');
    expect(normalizeBand('The Bandwagon Swing Orchestra')).toBe('bandwagon swing');
    expect(normalizeBand('Mats Lundmark Jazz Quartet')).toBe('mats lundmark jazz');
  });
});

describe('slugifyBand', () => {
  it('makes a kebab id, accent-free', () => {
    expect(slugifyBand('Tommy Löbel Swing Band')).toBe('tommy-lobel-swing-band');
    expect(slugifyBand('Webop Kvintett')).toBe('webop-kvintett');
  });
});

describe('similarity', () => {
  it('is 1 for identical and lower for divergent', () => {
    expect(similarity('webop', 'webop')).toBe(1);
    expect(similarity('webop', 'mellow')).toBeLessThan(0.4);
  });
});

describe('classify', () => {
  it('trusts a known band despite accent + suffix variance', () => {
    expect(classify('Tommy Löbel', roster).status).toBe('trusted');
    expect(classify('Tommy Lobel Swing Band', roster).status).toBe('trusted');
  });

  it('trusts via an alias', () => {
    expect(classify('Bandwagon', roster).status).toBe('trusted');
  });

  it('rejects a swing=no band (suppressed, not re-surfaced)', () => {
    expect(classify('Webop Kvintett', roster).status).toBe('rejected');
  });

  it('treats a swing=unknown band as pending (already surfaced)', () => {
    expect(classify('Mellow', roster).status).toBe('pending');
  });

  it('marks a genuinely unseen act as new', () => {
    expect(classify('Rickard Malmsten Group', roster).status).toBe('new');
    expect(classify('Some Brand New Quartet', roster).status).toBe('new');
  });

  it('handles empty/garbage names as new', () => {
    expect(classify('', roster).status).toBe('new');
  });
});
