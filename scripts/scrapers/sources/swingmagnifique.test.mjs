import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, relevance } from './swingmagnifique.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = readFileSync(path.join(here, '../fixtures/swingmagnifique.html'), 'utf-8');

// Fixed ref date for determinism. The fixture lists gigs from Sep–Dec,
// with no year in the HTML.
const REF = { year: 2026, month: 6 };
const events = parse(html, REF);

describe('swingmagnifique parser', () => {
  it('declares all relevance (swing-dedicated band)', () => {
    expect(relevance).toBe('all');
  });

  it('parses the calendar table rows', () => {
    // The fixture has 5 events, all at unmapped venues (Georgian House,
    // Sankt Eriks Jazzbar), so they land in unknownVenues, not events.
    expect(events.length + events.unknownVenues.length).toBe(5);
  });

  it('flags unknown venues rather than emitting events', () => {
    expect(events.unknownVenues.length).toBe(5);
    expect(events.length).toBe(0);
  });

  it('captures location and date for unknown venues', () => {
    const georgian = events.unknownVenues.filter((v) => v.location.includes('Georgian'));
    expect(georgian.length).toBe(3);
    expect(georgian[0].date).toBe('2026-09-16');
    expect(georgian[0].location).toBe('Georgian House, Stockholm');
  });

  it('resolves dates correctly with the reference year', () => {
    const dates = events.unknownVenues.map((v) => v.date).sort();
    expect(dates).toEqual([
      '2026-09-16',
      '2026-10-09',
      '2026-10-21',
      '2026-11-27',
      '2026-12-16',
    ]);
  });

  it('resolves year-wrap correctly', () => {
    const lateRef = parse(html, { year: 2026, month: 11 });
    const dates = lateRef.unknownVenues.map((v) => v.date).sort();
    // Sep and Oct are before Nov ref → next year
    expect(dates[0]).toBe('2026-11-27');
    expect(dates[1]).toBe('2026-12-16');
    expect(dates[2]).toBe('2027-09-16');
    expect(dates[3]).toBe('2027-10-09');
    expect(dates[4]).toBe('2027-10-21');
  });

  it('emits events when venue map matches', () => {
    // Craft HTML with a known venue (S:ta Clara) to verify mapping works.
    const fakeHtml = `<table><tbody>
      <tr class="border-accent">
        <td class="event-date"><a>
          <span class="date-long"><span class="event-when with-time"><time class="from">
            <span class="date">Friday, July 10</span> @ <span class="time">7:00PM</span>
          </time></span></span>
        </a></td>
        <td class="event-name"><a>
          <span class="text">Swing Magnifique / S:ta Clara Bierhaus</span>
          <span class="text text-tertiary">S:ta Clara Bierhaus, Stockholm</span>
        </a></td>
        <td class="event-location"><a>
          <span class="text text-tertiary">S:ta Clara Bierhaus, Stockholm</span>
        </a></td>
      </tr>
    </tbody></table>`;
    const result = parse(fakeHtml, { year: 2026, month: 6 });
    expect(result.length).toBe(1);
    expect(result.unknownVenues.length).toBe(0);
    expect(result[0]).toMatchObject({
      id: 'swingmagnifique-staclara-2026-07-10',
      name: 'Swing Magnifique / S:ta Clara Bierhaus',
      venueId: 'staclara',
      date: '2026-07-10',
      start: '19:00',
      music: 'live',
      band: 'Swing Magnifique',
      organizer: 'Swing Magnifique',
      status: 'live',
    });
  });

  it('parses AM/PM times correctly', () => {
    const makeRow = (time) => `<table><tbody>
      <tr class="border-accent">
        <td class="event-date"><a>
          <span class="date-long"><span class="event-when with-time"><time class="from">
            <span class="date">Friday, July 10</span> @ <span class="time">${time}</span>
          </time></span></span>
        </a></td>
        <td class="event-name"><a>
          <span class="text">Test</span>
          <span class="text text-tertiary">Norrport, Stockholm</span>
        </a></td>
        <td class="event-location"><a>
          <span class="text text-tertiary">Norrport, Stockholm</span>
        </a></td>
      </tr>
    </tbody></table>`;

    expect(parse(makeRow('6:30PM'), REF)[0].start).toBe('18:30');
    expect(parse(makeRow('9:00PM'), REF)[0].start).toBe('21:00');
    expect(parse(makeRow('12:00PM'), REF)[0].start).toBe('12:00');
    expect(parse(makeRow('12:00AM'), REF)[0].start).toBe('00:00');
    expect(parse(makeRow('11:30AM'), REF)[0].start).toBe('11:30');
  });
});
