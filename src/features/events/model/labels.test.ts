import { describe, expect, it } from 'vitest';
import { beginnerClassLabel, floorTypeLabel, styleFilterLabel, styleLabel } from './labels';

describe('styleLabel', () => {
  it('leaves dance style names untranslated in Swedish — that is what dancers call them', () => {
    expect(styleLabel('lindy-hop', undefined, 'sv')).toBe('Lindy Hop');
    expect(styleLabel('balboa', undefined, 'sv')).toBe('Balboa');
  });

  it('translates the "all styles" sentence in Swedish, matching the data\'s "socialdans"', () => {
    expect(styleLabel('all', undefined, 'sv')).toBe('Socialdans – alla stilar');
    expect(styleLabel('all', { compact: true }, 'sv')).toBe('Alla stilar');
  });
});

describe('styleFilterLabel', () => {
  it('translates the filter panel\'s "no filter" word in Swedish', () => {
    expect(styleFilterLabel('all', 'sv')).toBe('Alla stilar');
  });
});

describe('beginnerClassLabel', () => {
  it('translates the plain-yes case in Swedish', () => {
    expect(beginnerClassLabel('yes', 'sv')).toBe('Nybörjarvänlig');
  });

  it('interpolates the class time into the Swedish template', () => {
    expect(beginnerClassLabel('19:00', 'sv')).toBe('Nybörjarkurs 19:00');
  });
});

describe('floorTypeLabel', () => {
  it('translates every floor type in Swedish', () => {
    expect(floorTypeLabel('studio', 'sv')).toBe('Dansstudio');
    expect(floorTypeLabel('hall', 'sv')).toBe('Danssal');
    expect(floorTypeLabel('bar', 'sv')).toBe('Bar/restaurang');
    expect(floorTypeLabel('outdoor', 'sv')).toBe('Utomhus');
  });
});
