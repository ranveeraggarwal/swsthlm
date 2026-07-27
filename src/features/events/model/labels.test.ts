// The value→words tables, in both locales. The point of these cases is less
// "does the string match" than "does each locale get its own string" — the
// tables are exhaustive by type, so a missing entry is a compile error, but
// nothing stops a Swedish entry being an English copy-paste.

import { describe, expect, it } from 'vitest';
import {
  beginnerClassLabel,
  floorTypeLabel,
  styleFilterLabel,
  styleLabel,
} from './labels';

describe('styleLabel', () => {
  it('gives the full label in English', () => {
    expect(styleLabel('lindy-hop', 'en')).toBe('Lindy Hop');
    expect(styleLabel('all', 'en')).toBe('Social – all styles');
  });

  it('keeps the dance names untranslated — they are what Swedish dancers say', () => {
    expect(styleLabel('lindy-hop', 'sv')).toBe('Lindy Hop');
    expect(styleLabel('balboa', 'sv')).toBe('Balboa');
    expect(styleLabel('blues', 'sv')).toBe('Blues');
    expect(styleLabel('shag', 'sv')).toBe('Shag');
  });

  it('translates the "social" catch-all, matching the wording in the data', () => {
    expect(styleLabel('all', 'sv')).toBe('Socialdans – alla stilar');
  });

  it('uses the compact form for the dense row list', () => {
    expect(styleLabel('all', 'en', { compact: true })).toBe('All styles');
    expect(styleLabel('all', 'sv', { compact: true })).toBe('Alla stilar');
  });

  it('falls back to the full label when there is no compact form', () => {
    expect(styleLabel('balboa', 'en', { compact: true })).toBe('Balboa');
    expect(styleLabel('balboa', 'sv', { compact: true })).toBe('Balboa');
  });
});

describe('styleFilterLabel', () => {
  // "Don't filter" is a different sentence from "a social that welcomes all
  // styles" — in Swedish too.
  it('says "don\'t filter" rather than naming the social style', () => {
    expect(styleFilterLabel('all', 'en')).toBe('All Styles');
    expect(styleFilterLabel('all', 'sv')).toBe('Alla stilar');
  });

  it('falls back to the chip label for a real style', () => {
    expect(styleFilterLabel('shag', 'en')).toBe('Shag');
    expect(styleFilterLabel('shag', 'sv')).toBe('Shag');
  });
});

describe('beginnerClassLabel', () => {
  it('reads as a promise for a plain yes', () => {
    expect(beginnerClassLabel('yes', 'en')).toBe('Beginner friendly');
    expect(beginnerClassLabel('yes', 'sv')).toBe('Nybörjarvänlig');
  });

  it('is case-insensitive about the stored value', () => {
    expect(beginnerClassLabel('YES', 'en')).toBe('Beginner friendly');
    expect(beginnerClassLabel('Yes', 'sv')).toBe('Nybörjarvänlig');
  });

  it('names the start time when the column holds one', () => {
    expect(beginnerClassLabel('19:00', 'en')).toBe('Beginner class 19:00');
    expect(beginnerClassLabel('19:00', 'sv')).toBe('Nybörjarkurs 19:00');
  });
});

describe('floorTypeLabel', () => {
  it('describes the room in English', () => {
    expect(floorTypeLabel('studio', 'en')).toBe('Dance studio');
    expect(floorTypeLabel('hall', 'en')).toBe('Dance hall');
    expect(floorTypeLabel('bar', 'en')).toBe('Bar / restaurant');
    expect(floorTypeLabel('outdoor', 'en')).toBe('Outdoor');
  });

  it('describes the room in Swedish', () => {
    expect(floorTypeLabel('studio', 'sv')).toBe('Dansstudio');
    expect(floorTypeLabel('hall', 'sv')).toBe('Danssal');
    expect(floorTypeLabel('bar', 'sv')).toBe('Bar / restaurang');
    expect(floorTypeLabel('outdoor', 'sv')).toBe('Utomhus');
  });
});
