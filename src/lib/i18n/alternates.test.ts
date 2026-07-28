import { describe, expect, it } from 'vitest';
import { hreflangLanguages, localeAlternates, localeUrl } from './alternates';
import { SITE_URL } from '@/lib/site';

const PATHS = ['/', '/about', '/event/p-tzz-dah/2026-08-15'];

describe('localeUrl', () => {
  it('builds absolute URLs on the canonical host', () => {
    expect(localeUrl('en', '/about')).toBe(`${SITE_URL}/about`);
    expect(localeUrl('sv', '/about')).toBe(`${SITE_URL}/sv/about`);
    expect(localeUrl('en', '/')).toBe(`${SITE_URL}/`);
    expect(localeUrl('sv', '/')).toBe(`${SITE_URL}/sv`);
  });

  it('is idempotent — an already-prefixed path is not double-prefixed', () => {
    expect(localeUrl('sv', '/sv/about')).toBe(`${SITE_URL}/sv/about`);
    expect(localeUrl('en', '/sv/about')).toBe(`${SITE_URL}/about`);
  });
});

describe('hreflangLanguages', () => {
  it('points x-default at the English URL', () => {
    for (const path of PATHS) {
      const languages = hreflangLanguages(path);
      expect(languages['x-default']).toBe(languages.en);
    }
  });

  it('lists both trees', () => {
    expect(hreflangLanguages('/about')).toEqual({
      en: `${SITE_URL}/about`,
      sv: `${SITE_URL}/sv/about`,
      'x-default': `${SITE_URL}/about`,
    });
  });
});

describe('localeAlternates', () => {
  it('canonicalises each locale to itself, never to the other tree', () => {
    // A `/sv` page canonicalising to `/` would drop the Swedish tree out of
    // the index entirely — the failure mode this whole sub-issue guards.
    expect(localeAlternates('sv', '/').canonical).toBe(`${SITE_URL}/sv`);
    expect(localeAlternates('en', '/').canonical).toBe(`${SITE_URL}/`);
    expect(localeAlternates('sv', '/about').canonical).toBe(`${SITE_URL}/sv/about`);
  });

  it('is reciprocal: each locale advertises the other, and points back', () => {
    for (const path of PATHS) {
      const en = localeAlternates('en', path);
      const sv = localeAlternates('sv', path);

      // What the English page advertises as the Swedish alternate is exactly
      // the URL the Swedish page claims as its canonical, and vice versa.
      expect(en.languages.sv).toBe(sv.canonical);
      expect(sv.languages.en).toBe(en.canonical);

      // Identical maps on both sides — Google discards one-directional
      // annotations, so the two pages must agree exactly.
      expect(en.languages).toEqual(sv.languages);
    }
  });

  it('accepts a Swedish path and still produces the English pair', () => {
    expect(localeAlternates('sv', '/sv/about')).toEqual(localeAlternates('sv', '/about'));
  });
});
