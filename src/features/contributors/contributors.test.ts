import { describe, expect, it } from 'vitest';
import { CONTRIBUTORS } from './contributors';

describe('CONTRIBUTORS', () => {
  it('has at least one contributor', () => {
    expect(CONTRIBUTORS.length).toBeGreaterThan(0);
  });

  it('gives every contributor a non-empty name', () => {
    for (const contributor of CONTRIBUTORS) {
      expect(contributor.name.trim()).not.toBe('');
    }
  });

  it('keeps names unique (they are React keys)', () => {
    const names = CONTRIBUTORS.map((contributor) => contributor.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('only uses https GitHub URLs where present', () => {
    for (const contributor of CONTRIBUTORS) {
      if (contributor.githubUrl !== undefined) {
        expect(contributor.githubUrl).toMatch(/^https:\/\/github\.com\/[\w-]+$/);
      }
    }
  });
});
