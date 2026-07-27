import { describe, expect, it } from 'vitest';
import { localePath, stripLocale } from './locale';

describe('localePath', () => {
  it('leaves English paths unchanged', () => {
    expect(localePath('en', '/')).toBe('/');
    expect(localePath('en', '/about')).toBe('/about');
    expect(localePath('en', '/event/p-tzz-dah/2026-08-15')).toBe('/event/p-tzz-dah/2026-08-15');
  });

  it('prefixes Swedish paths with /sv, without a trailing slash for the root', () => {
    expect(localePath('sv', '/')).toBe('/sv');
    expect(localePath('sv', '/about')).toBe('/sv/about');
    expect(localePath('sv', '/event/p-tzz-dah/2026-08-15')).toBe('/sv/event/p-tzz-dah/2026-08-15');
  });
});

describe('stripLocale', () => {
  it('leaves English paths unchanged', () => {
    expect(stripLocale('/')).toBe('/');
    expect(stripLocale('/about')).toBe('/about');
  });

  it('strips the /sv prefix, mapping /sv itself back to root', () => {
    expect(stripLocale('/sv')).toBe('/');
    expect(stripLocale('/sv/about')).toBe('/about');
    expect(stripLocale('/sv/event/p-tzz-dah/2026-08-15')).toBe('/event/p-tzz-dah/2026-08-15');
  });
});

describe('round-trip', () => {
  const paths = ['/', '/about', '/event/p-tzz-dah/2026-08-15'];

  it('localePath(locale, p) then stripLocale returns the original English path', () => {
    for (const path of paths) {
      expect(stripLocale(localePath('en', path))).toBe(path);
      expect(stripLocale(localePath('sv', path))).toBe(path);
    }
  });

  it('stripLocale then localePath(sv, ...) recreates the Swedish path', () => {
    expect(localePath('sv', stripLocale('/sv/about'))).toBe('/sv/about');
  });
});
