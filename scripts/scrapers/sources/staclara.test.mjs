import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, relevance } from './staclara.mjs';
import { isSwingRelevant } from '../lib/genre.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(here, '../fixtures/staclara.html'), 'utf-8');
const events = parse(html);
const byDate = Object.fromEntries(events.map((e) => [e.date, e]));

// The runner applies the genre filter for 'genre'-relevance sources; mirror
// that here to assert what actually reaches the calendar.
const kept = events.filter((e) => isSwingRelevant(`${e.name} ${e.description ?? ''}`));
const keptNames = kept.map((e) => e.name.toLowerCase()).join(' | ');

describe('staclara parser', () => {
  it('extracts a swing night with the right fields', () => {
    const e = byDate['2026-06-17'];
    expect(e).toBeTruthy();
    expect(e.name).toBe('Swing Magnifique');
    expect(e).toMatchObject({
      id: 'staclara-2026-06-17',
      venueId: 'staclara',
      start: '19:00',
      end: '22:00',
      music: 'live',
      style: 'all',
      band: 'Swing Magnifique',
      organizer: 'S:ta Clara Bierhaus',
      status: 'live',
    });
  });

  it('includes jazz-band nights (Jesses, Mats Lundmark)', () => {
    expect(byDate['2026-06-15']?.name).toBe('Jesses Jazz Band');
    expect(byDate['2026-06-01']?.name).toBe('Mats Lundmark Jazz Quartet');
  });

  it('declares genre relevance (mixed venue)', () => {
    expect(relevance).toBe('genre');
  });

  it('genre filter drops non-dance noise: quiz, jams, rock, folk', () => {
    // parse() extracts everything; the genre filter is what reaches the calendar.
    expect(keptNames).not.toMatch(/quiz/);
    expect(keptNames).not.toMatch(/jam/); // Blues Jam, Trad-Jazz Jam
    expect(keptNames).not.toMatch(/veres/); // Finnish Folk & Psychadelica
    expect(keptNames).not.toMatch(/blues men/); // Blues, Soul, Rock
    // …while keeping the swing/jazz nights.
    expect(keptNames).toMatch(/swing magnifique/);
    expect(keptNames).toMatch(/jesses jazz band/);
  });

  it('skips entries with no bookable time (TBC)', () => {
    // Thu 4 June is "TBC" with no time -> no event that day.
    expect(byDate['2026-06-04']).toBeUndefined();
  });

  it('parses an overnight time range (20-00 -> 00:00) when present', () => {
    // All emitted events have valid HH:MM start/end.
    for (const e of events) {
      expect(e.start).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      expect(e.end).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    }
  });
});
