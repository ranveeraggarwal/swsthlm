import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, relevance } from './chicago.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(here, '../fixtures/chicago.html'), 'utf-8');
const events = parse(html);
const byDate = Object.fromEntries(events.map((e) => [e.date, e]));

describe('chicago parser', () => {
  it('extracts a real event with correct fields', () => {
    // Picking "Chicago Swing Wednesdays - DJs The Hot Shots" on 17/6
    const e = byDate['2026-06-17'];
    expect(e).toBeTruthy();
    expect(e.name).toBe('Chicago Swing Wednesdays - Djs The Hot Shots');
    expect(e).toMatchObject({
      id: 'chicago-2026-06-17',
      venueId: 'chicago',
      date: '2026-06-17',
      start: '20:00', // from global Wednesday fallback in the fixture
      end: '23:00',
      organizer: 'Chicago Swing Dance Studio',
      status: 'live',
    });
  });

  it('declares relevance: all', () => {
    expect(relevance).toBe('all');
  });

  it('all emitted events have valid HH:MM times', () => {
    for (const e of events) {
      expect(e.start).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      if (e.end) {
        expect(e.end).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      }
    }
  });

  it('picks up "Säsongspremiär + Öppet Hus – Chicago Live Wednesdays"', () => {
    const e = byDate['2026-08-26'];
    expect(e).toBeTruthy();
    expect(e.name).toBe('Säsongspremiär + Öppet Hus – Chicago Live Wednesdays');
    expect(e.music).toBe('live');
  });
});
