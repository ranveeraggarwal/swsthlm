import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, relevance } from './arstaliden.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(here, '../fixtures/arstaliden.html'), 'utf-8');

// The fixture page mentions "sommaren 2026" in its text, so parse extracts
// 2026 as the year — no ref date needed for the fixture.
const events = parse(html);
const byDate = Object.fromEntries(events.map((e) => [e.date, e]));

describe('arstaliden parser', () => {
  it('extracts the right number of events', () => {
    expect(events.length).toBe(6);
  });

  it('extracts the first event with correct fields', () => {
    const e = byDate['2026-05-15'];
    expect(e).toBeTruthy();
    expect(e).toMatchObject({
      id: 'arstaliden-2026-05-15',
      name: 'Lindyhop i Årsta',
      style: 'lindy-hop',
      venueId: 'arstaliden',
      date: '2026-05-15',
      start: '18:00',
      end: '22:00',
      music: 'dj',
      organizer: 'Årstaliden',
      status: 'live',
    });
  });

  it('extracts all six dates', () => {
    const dates = events.map((e) => e.date).sort();
    expect(dates).toEqual([
      '2026-05-15',
      '2026-05-29',
      '2026-06-12',
      '2026-06-26',
      '2026-08-07',
      '2026-08-21',
    ]);
  });

  it('resolves year from page text, not ref date', () => {
    // Even with a ref date far in the future, the year comes from page text.
    const e = parse(html, { year: 2099, month: 1 });
    expect(e[0].date).toMatch(/^2026-/);
  });

  it('falls back to ref year when no year in page text', () => {
    const bare = '<ul><li>Fredag den 15/5<ul><li>kl 18 - 22 Social dans</li></ul></li></ul>';
    const e = parse(bare, { year: 2027, month: 1 });
    expect(e[0].date).toBe('2027-05-15');
  });

  it('declares all relevance (Lindy-dedicated venue)', () => {
    expect(relevance).toBe('all');
  });

  it('leaves description empty', () => {
    for (const e of events) {
      expect(e.description).toBe('');
    }
  });

  it('all times are valid HH:MM', () => {
    for (const e of events) {
      expect(e.start).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      expect(e.end).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    }
  });

  it('does not produce duplicates', () => {
    const dates = events.map((e) => e.date);
    expect(new Set(dates).size).toBe(dates.length);
  });
});
