import { describe, expect, it } from 'vitest';
import { offerableLocale } from './detect';

// The rule these pin: walk the visitor's languages in preference order, take
// the first one we ship, and say nothing if that's what they're already
// reading. Order matters more than presence — see the `en-GB, sv-SE` case.

describe('offerableLocale', () => {
  it('offers a supported language the visitor prefers over the current one', () => {
    expect(offerableLocale(['sv-SE', 'en-US'])).toBe('sv');
  });

  it('matches on the primary subtag, so regional variants count', () => {
    expect(offerableLocale(['sv'])).toBe('sv');
    expect(offerableLocale(['sv-FI'])).toBe('sv');
    expect(offerableLocale(['SV-se'])).toBe('sv');
  });

  it('says nothing when the visitor prefers the language they are reading', () => {
    expect(offerableLocale(['en-GB', 'sv-SE'])).toBeNull();
    expect(offerableLocale(['en'])).toBeNull();
  });

  it('says nothing when no listed language is one we ship', () => {
    expect(offerableLocale(['de-DE', 'fr'])).toBeNull();
    expect(offerableLocale([])).toBeNull();
  });

  it('skips unsupported languages ahead of a supported one', () => {
    // German first, but we don't ship German — Swedish is the first real hit.
    expect(offerableLocale(['de-DE', 'sv-SE', 'en-US'])).toBe('sv');
  });

  it('respects the locale actually being displayed, not just the default', () => {
    // Someone reading Swedish whose browser wants English gets offered English.
    expect(offerableLocale(['en-US'], 'sv')).toBe('en');
    // …and is asked nothing once both agree.
    expect(offerableLocale(['sv-SE'], 'sv')).toBeNull();
  });

  it('ignores blank and malformed tags rather than matching on them', () => {
    expect(offerableLocale(['', '   ', '-', 'sv-SE'])).toBe('sv');
    expect(offerableLocale(['', '-'])).toBeNull();
  });
});
