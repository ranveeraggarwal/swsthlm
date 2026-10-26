import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { parse, relevance } from './norrport.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(here, '../fixtures/norrport.html'), 'utf-8');
const events = parse(html);
const byDate = Object.fromEntries(events.map((e) => [e.date, e]));

// One card in the shape the live page uses, for cases the fixture doesn't
// happen to contain (explicit end times, title suffixes, midnight wrap).
const card = ({
  date = '2026-11-05',
  meta = '📅 Torsdag 5 nov kl 19:00',
  title = 'Some Band | Norrport Live',
} = {}) => `
<div class="np-grid-card" data-np-grid-date="${date}">
  <div class="np-grid-content">
    <h3 class="np-grid-title"><a href="https://norrport.se/norrportlive/x-${date}/">${title}</a></h3>
    <p class="np-grid-meta">${meta}</p>
    <div class="np-grid-action-row">
      <button type="button" class="np-grid-btn np-grid-btn-book" data-np-book-event="1" data-date="${date}">BOKA HÄR</button>
    </div>
  </div>
</div>`;

describe('norrport parser', () => {
  it('parses the live calendar at all', () => {
    // The markup changed once and the parser silently returned 0 events.
    expect(events.length).toBeGreaterThan(50);
  });

  it('parses every bookable card', () => {
    const bookable = cheerio.load(html)('.np-grid-card [data-np-book-event]').length;
    expect(bookable).toBeGreaterThan(50);
    expect(events).toHaveLength(bookable);
  });

  it('extracts Old Boy Stompers with the right fields', () => {
    const e = byDate['2026-10-29'];
    expect(e).toBeTruthy();
    expect(e).toMatchObject({
      id: 'norrport-2026-10-29',
      name: 'Old Boy Stompers',
      venueId: 'norrport',
      date: '2026-10-29',
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
    const e = byDate['2026-11-26'];
    expect(e).toBeTruthy();
    expect(e.name).toBe("Josefin's New Orleans Gang");
    expect(e.start).toBe('19:00');
    expect(e.end).toBe('22:00');
  });

  it('declares roster relevance (mixed venue)', () => {
    expect(relevance).toBe('roster');
  });

  it('strips decoration from titles', () => {
    // trailing "!" and emoji
    expect(byDate['2026-10-29']?.band).toBe('Old Boy Stompers');
    // trailing colon
    expect(byDate['2026-11-14']?.band).toBe('Selander Quartet');
    // curly apostrophe
    expect(byDate['2026-11-26']?.band).toBe("Josefin's New Orleans Gang");
    for (const e of events) {
      expect(e.name).not.toMatch(/[\p{Extended_Pictographic}️]/u);
      expect(e.band).not.toMatch(/[!:]$/);
    }
  });

  it('strips the venue suffix and the concert prefix', () => {
    const band = (title) => parse(card({ title }))[0].band;
    expect(band('Bluesväder på Norrport | Norrport Live')).toBe('Bluesväder');
    expect(band('Siberian Hotheads live at Norrport')).toBe('Siberian Hotheads');
    expect(band('Konsert med Larmet och Beckius, Bratt & Hansson')).toBe(
      'Larmet och Beckius, Bratt & Hansson',
    );
  });

  it('skips cards without a booking button (STÄNGT/closed)', () => {
    const ids = events.map((e) => e.id);
    expect(ids).not.toContain('norrport-2026-12-24');
    expect(ids).not.toContain('norrport-2027-01-01');
  });

  it('skips private events, whose booking button is disabled and has no date', () => {
    // ABONNERAT: "Abonnerat (Slutet sällskap)".
    expect(byDate['2026-11-28']).toBeUndefined();
  });

  it('skips cards with no start time', () => {
    expect(parse(card({ meta: '📅 Torsdag 5 nov' }))).toHaveLength(0);
  });

  it('includes hidden-grid cards (behind load more)', () => {
    expect(byDate['2026-12-31']).toBeTruthy();
    expect(byDate['2026-12-31']).toMatchObject({ start: '19:00', end: '22:00' });
    expect(byDate['2027-04-30']).toBeTruthy();
  });

  it('keeps an explicit end time when the card has one', () => {
    const [e] = parse(card({ meta: '📅 Torsdag 5 nov kl 19:00 - 21:30' }));
    expect(e).toMatchObject({ start: '19:00', end: '21:30' });
  });

  it('fills a missing end with the usual three-hour slot', () => {
    const [e] = parse(card({ meta: '📅 Lördag 7 nov kl 20:00' }));
    expect(e).toMatchObject({ start: '20:00', end: '23:00' });
    expect(byDate['2026-11-07']).toMatchObject({ start: '20:00', end: '23:00' });
  });

  it('wraps the filled end past midnight', () => {
    const [e] = parse(card({ meta: '📅 Lördag 7 nov kl 23:00' }));
    expect(e).toMatchObject({ start: '23:00', end: '02:00' });
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
    const e = byDate['2026-10-29'];
    expect(e.url).toBe('https://norrport.se/norrportlive/old-boy-stompers-2026-10-29/');
  });
});
