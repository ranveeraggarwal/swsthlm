import { describe, it, expect } from 'vitest';
import { isSwingRelevant } from './genre.mjs';

describe('isSwingRelevant', () => {
  it('keeps jazz/swing nights', () => {
    expect(isSwingRelevant('Swing Magnifique Django Reinhardt Swing Jazz!')).toBe(true);
    expect(isSwingRelevant('Jesses Jazz Band Trad Jazz!')).toBe(true);
    expect(isSwingRelevant('Webop Kvintett Hardbop & Blue Note Jazz!')).toBe(true);
  });

  it('drops non-dance programming', () => {
    expect(isSwingRelevant('Quizz Night With Per Eggers')).toBe(false);
    expect(isSwingRelevant('Blues Jam with Jam-leader')).toBe(false);
    expect(isSwingRelevant('Veres Finnish Folk & Psychadelica!')).toBe(false);
    expect(isSwingRelevant('Blues Men Blues, Soul, Rock!')).toBe(false); // rock wins
  });

  it('does not false-exclude on substrings (the invisible-failure case)', () => {
    // 'jam' must not exclude James/Jamboree; 'pop' must not exclude Popcorn.
    expect(isSwingRelevant('Jamboree Swing Band')).toBe(true);
    expect(isSwingRelevant('James Morrison Quartet jazz')).toBe(true);
    expect(isSwingRelevant('Popcorn Jazz')).toBe(true);
    expect(isSwingRelevant('Soulful Trad Jazz')).toBe(true); // 'soul' != 'soulful'
  });

  it('returns false for unmatched genres', () => {
    expect(isSwingRelevant('TBC')).toBe(false);
    expect(isSwingRelevant('Classical Piano Recital')).toBe(false);
  });
});
