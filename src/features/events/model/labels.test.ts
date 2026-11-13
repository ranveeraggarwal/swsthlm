import { describe, expect, it } from 'vitest';
import {
  beginnerClassLabel,
  beginnerEyebrowLabel,
  cardLiftTilt,
  danceabilityLabel,
  danceabilityTone,
  formatPriceLine,
  isFreePrice,
  musicBadgeLabel,
  recordLabelTone,
  styleChipClass,
  styleEyebrowClass,
  styleFilterLabel,
  styleLabel,
  tasterEyebrowLabel,
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

describe('beginnerClassLabel & eyebrow class labels', () => {
  it('translates the plain-yes case in Swedish', () => {
    expect(beginnerClassLabel('yes', 'sv')).toBe('Nybörjarvänlig');
    expect(beginnerEyebrowLabel('yes', 'sv')).toBe('Nybörjarvänlig');
  });

  it('interpolates the class time into both full and compact eyebrow templates', () => {
    expect(beginnerClassLabel('19:00', 'sv')).toBe('Nybörjarkurs 19:00');
    expect(beginnerEyebrowLabel('19:00')).toBe('Intro 19:00');
    expect(beginnerEyebrowLabel('19:00', 'sv')).toBe('Prova-på 19:00');
    expect(tasterEyebrowLabel('18:30')).toBe('Taster 18:30');
    expect(tasterEyebrowLabel('18:30', 'sv')).toBe('Smakprov 18:30');
  });
});

describe('danceabilityLabel & danceabilityTone', () => {
  it('maps every 1–5 score to its fixed English and Swedish label', () => {
    expect(danceabilityLabel(5)).toBe('Studio floor');
    expect(danceabilityLabel(4)).toBe('Ballroom / hall');
    expect(danceabilityLabel(3)).toBe('Casual dance floor');
    expect(danceabilityLabel(2)).toBe('Small bar floor');
    expect(danceabilityLabel(1)).toBe('Tableside / pub');

    expect(danceabilityLabel(5, 'sv')).toBe('Dansstudio');
    expect(danceabilityLabel(4, 'sv')).toBe('Danssal');
    expect(danceabilityLabel(3, 'sv')).toBe('Enklare dansgolv');
    expect(danceabilityLabel(2, 'sv')).toBe('Litet bargolv');
    expect(danceabilityLabel(1, 'sv')).toBe('Pub / mest lyssning');
  });

  it('buckets 4–5 into success, 3 into tertiary, and 1–2 into caution tokens', () => {
    expect(danceabilityTone(5).barClass).toContain('--on-success-container');
    expect(danceabilityTone(4).barClass).toContain('--on-success-container');
    expect(danceabilityTone(3).barClass).toContain('--tertiary');
    expect(danceabilityTone(2).barClass).toContain('--on-caution-container');
    expect(danceabilityTone(1).barClass).toContain('--on-caution-container');
  });
});

describe('price helpers', () => {
  it('detects free admission in English and Swedish phrasing', () => {
    expect(isFreePrice('Free')).toBe(true);
    expect(isFreePrice('Free (no booking needed)')).toBe(true);
    expect(isFreePrice('fri entré - men swisha dricks till husbandet!')).toBe(true);
    expect(isFreePrice('100 kr')).toBe(false);
    expect(isFreePrice(undefined)).toBe(false);
  });

  it('formats price and payment cleanly without nested parentheses', () => {
    expect(formatPriceLine('50/100 kr', 'Swish/cash')).toBe('50/100 kr (Swish/cash)');
    expect(formatPriceLine('40 kr (optional)', 'Swish')).toBe('40 kr (optional) · Swish');
    expect(formatPriceLine('Free')).toBe('Free');
    expect(formatPriceLine(undefined, undefined)).toBeUndefined();
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

describe('card print & whimsy helpers', () => {
  it('maps Lindy Hop, Blues, and Balboa chips and eyebrows to their dedicated style tokens', () => {
    expect(styleChipClass('lindy-hop')).toContain('--style-lindy');
    expect(styleChipClass('blues')).toContain('--style-blues');
    expect(styleChipClass('balboa')).toContain('--style-balboa');
    expect(styleChipClass('all')).toContain('--surface-container');

    expect(styleEyebrowClass('lindy-hop')).toContain('--style-lindy');
    expect(styleEyebrowClass('blues')).toContain('--style-blues');
    expect(styleEyebrowClass('balboa')).toContain('--style-balboa');
    expect(styleEyebrowClass('all')).toContain('--on-surface-variant');
  });

  it('pairs each 78 record label fill with its matching --on-* ink token', () => {
    expect(recordLabelTone('lindy-hop').fillClass).toContain('--style-lindy');
    expect(recordLabelTone('lindy-hop').strokeClass).toContain('--on-style-lindy');
    expect(recordLabelTone('blues').fillClass).toContain('--style-blues');
    expect(recordLabelTone('blues').strokeClass).toContain('--on-style-blues');
    expect(recordLabelTone('balboa').fillClass).toContain('--style-balboa');
    expect(recordLabelTone('balboa').strokeClass).toContain('--on-style-balboa');
    expect(recordLabelTone('all').fillClass).toContain('--primary');
    expect(recordLabelTone('all').strokeClass).toContain('--on-primary');
  });

  it('picks a subtle, non-zero deterministic lift tilt per occurrence id', () => {
    const tilt = cardLiftTilt('danshuset-2026-08:2026-08-28');
    expect(Math.abs(tilt)).toBeGreaterThan(0);
    expect(Math.abs(tilt)).toBeLessThanOrEqual(1);
    expect(cardLiftTilt('danshuset-2026-08:2026-08-28')).toBe(tilt);
  });
});
