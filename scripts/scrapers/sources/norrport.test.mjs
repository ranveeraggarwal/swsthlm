import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, relevance } from './norrport.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(here, '../fixtures/norrport.html'), 'utf-8');
const events = parse(html);
const byDate = Object.fromEntries(events.map((e) => [e.date, e]));

describe('norrport parser', () => {
  it('extracts Old Boy Stompers with the right fields', () => {
    const e = byDate['2026-06-18'];
    expect(e).toBeTruthy();
    expect(e).toMatchObject({
      id: 'norrport-2026-06-18',
      name: 'Old Boy Stompers',
      venueId: 'norrport',
      date: '2026-06-18',
      start: '19:00',
      end: '22:00',
      music: 'live',
      style: 'all',
      band: 'Old Boy Stompers',
      organizer: 'Norrport',
      status: 'live',
    });
  });

  it("extracts Josefin's New Orleans Gang", () => {
    const e = byDate['2026-06-25'];
    expect(e).toBeTruthy();
    expect(e.name).toBe("Josefin's New Orleans Gang");
    expect(e.start).toBe('19:00');
    expect(e.end).toBe('22:00');
  });

  it('declares roster relevance (mixed venue)', () => {
    expect(relevance).toBe('roster');
  });

  it('strips the venue suffix from titles', () => {
    expect(byDate['2026-06-18']?.band).toBe('Old Boy Stompers');
    expect(byDate['2026-06-17']?.band).toBe('Weyleyd');
  });

  it('skips cards without a booking button (STÄNGT/closed)', () => {
    const ids = events.map((e) => e.id);
    expect(ids).not.toContain('norrport-2026-06-20');
  });

  it('skips entries without a parseable time range (quiz)', () => {
    const metas = events.filter((e) => /quiz/i.test(e.name));
    expect(metas).toHaveLength(0);
  });

  it('includes hidden-grid cards (behind load more)', () => {
    expect(events.length).toBeGreaterThan(10);
    expect(byDate['2026-09-09']).toBeTruthy();
    expect(byDate['2026-09-09']?.name).toBe("Ballin' the Jack");
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

  it('uses per-event detail URLs, not the listing page', () => {
    const e = byDate['2026-06-18'];
    expect(e.url).toContain('/norrportlive/old-boy-stompers');
  });
});
