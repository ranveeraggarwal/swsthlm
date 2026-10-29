import { describe, expect, it } from 'vitest';
import {
  beginnerClassLabel,
  floorTypeLabel,
  musicBadgeLabel,
  styleFilterLabel,
  styleLabel,
} from './labels';

describe('styleLabel', () => {
  it('leaves dance style names untranslated in Swedish — that is what dancers call them', () => {
    expect(styleLabel('lindy-hop', undefined, 'sv')).toBe('Lindy Hop');
    expect(styleLabel('balboa', undefined, 'sv')).toBe('Balboa');
    expect(styleLabel('rock-n-roll', undefined, 'sv')).toBe('Rock\'n\'roll');
  });

  it('names rock-n-roll as itself, never as an all-styles social', () => {
    expect(styleLabel('rock-n-roll')).toBe('Rock\'n\'roll');
    expect(styleLabel('rock-n-roll', { compact: true })).toBe('Rock\'n\'roll');
    expect(styleFilterLabel('rock-n-roll')).toBe('Rock\'n\'roll');
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

describe('musicBadgeLabel', () => {
  it('names a mixed night as both, since the header carries one badge', () => {
    expect(musicBadgeLabel('mixed')).toBe('Live band + DJ');
  });

  it('translates every music value in Swedish', () => {
    expect(musicBadgeLabel('live', 'sv')).toBe('Liveband');
    expect(musicBadgeLabel('dj', 'sv')).toBe('DJ-set');
    expect(musicBadgeLabel('mixed', 'sv')).toBe('Liveband + DJ');
  });
});
