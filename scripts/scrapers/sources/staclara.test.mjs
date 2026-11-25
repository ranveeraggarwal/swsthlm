import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, relevance } from './staclara.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(here, '../fixtures/staclara.html'), 'utf-8');
const events = parse(html);
const byDate = Object.fromEntries(events.map((e) => [e.date, e]));

describe('staclara parser', () => {
  it('extracts a live-music night with the right fields', () => {
    const e = byDate['2026-11-19'];
    expect(e).toBeTruthy();
    expect(e.name).toBe('Peter B&K Band');
    expect(e).toMatchObject({
      id: 'staclara-2026-11-19',
      venueId: 'staclara',
      start: '19:00',
      end: '22:00',
      music: 'live',
      style: 'all',
      band: 'Peter B&K Band',
      organizer: 'S:ta Clara Bierhaus',
      description: 'Five Horn Jazz Band!',
      status: 'live',
    });
  });

  it('extracts every dated entry on the page', () => {
    expect(events).toHaveLength(15);
    expect(byDate['2026-11-23']?.band).toBe('Jesse´s Jazz Band');
  });

  it('declares roster relevance (mixed venue)', () => {
    expect(relevance).toBe('roster');
  });

  it('parses an overnight time range (20-00 -> 00:00)', () => {
    expect(byDate['2026-11-13']).toMatchObject({ start: '20:00', end: '00:00' });
    for (const e of events) {
      expect(e.start).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      expect(e.end).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    }
  });

  it('skips entries with no bookable time or a TBC placeholder', () => {
    const entry = (content) =>
      `<h2>DECEMBER 2026</h2><calendar-entry><script type="application/json">${JSON.stringify({ date: 'Fri 4', content })}</script></calendar-entry>`;
    expect(parse(entry('<p>TBC<BR>soon</p>'))).toEqual([]);
    expect(parse(entry('<p>TBC 19-22</p>'))).toEqual([]);
  });
});
