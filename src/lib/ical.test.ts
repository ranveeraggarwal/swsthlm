import { describe, expect, it } from 'vitest';
import { buildCalendar, buildSingleEventCalendar } from './ical';
import type { SwingEvent } from '@/types/event';

const baseEvent = (overrides: Partial<SwingEvent> = {}): SwingEvent => ({
  id: 'chicago-friday:2026-07-03',
  title: 'Friday Social',
  status: 'published',
  cancelled: false,
  date: '2026-07-03',
  start: '20:00',
  end: '23:00',
  venue: 'Chicago Swing Dance Studio',
  address: 'Hornsgatan 75',
  neighborhood: 'Söder',
  style: 'lindy',
  music: 'dj',
  organizer: 'Chicago',
  price: '120 kr',
  ticket: 'https://example.com/tickets',
  body: 'Come dance with us.',
  sourceType: 'series',
  sourceId: 'chicago-friday',
  ...overrides,
});

const SITE = 'https://stockholmswing.com';
const buildOne = (e: SwingEvent) =>
  buildCalendar([e], { siteUrl: SITE, now: new Date('2026-06-17T00:00:00Z') });

describe('buildCalendar', () => {
  it('wraps events in a VCALENDAR with the expected headers', () => {
    const ics = buildOne(baseEvent());
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Stockholm Swing//Dance Calendar//EN');
    expect(ics).toContain('X-WR-CALNAME:Stockholm Swing Dance Calendar');
    expect(ics).toContain('REFRESH-INTERVAL;VALUE=DURATION:PT12H');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('embeds a Europe/Stockholm VTIMEZONE with both DST rules', () => {
    const ics = buildOne(baseEvent());
    expect(ics).toContain('BEGIN:VTIMEZONE');
    expect(ics).toContain('TZID:Europe/Stockholm');
    // Daylight: last Sunday of March, +0100 -> +0200.
    expect(ics).toContain('RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU');
    expect(ics).toContain('TZOFFSETTO:+0200');
    expect(ics).toContain('TZNAME:CEST');
    // Standard: last Sunday of October, +0200 -> +0100.
    expect(ics).toContain('RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU');
    expect(ics).toContain('TZNAME:CET');
    expect(ics).toContain('END:VTIMEZONE');
  });

  it('uses CRLF line endings', () => {
    const ics = buildOne(baseEvent());
    expect(ics).toContain('\r\n');
    // No bare LF that is not part of a CRLF pair.
    expect(/[^\r]\n/.test(ics)).toBe(false);
  });

  it('emits a stable UID derived from the occurrence id', () => {
    const ics = buildOne(baseEvent());
    expect(ics).toContain('UID:chicago-friday:2026-07-03@stockholmswing.com');
  });

  it('emits DTSTART/DTEND as Stockholm-local times tagged with TZID', () => {
    const ics = buildOne(baseEvent());
    expect(ics).toContain('DTSTART;TZID=Europe/Stockholm:20260703T200000');
    expect(ics).toContain('DTEND;TZID=Europe/Stockholm:20260703T230000');
  });

  it('keeps DTSTAMP in UTC', () => {
    const ics = buildOne(baseEvent());
    expect(ics).toContain('DTSTAMP:20260617T000000Z');
  });

  it('rolls DTEND to the next day for overnight events', () => {
    const ics = buildOne(baseEvent({ start: '22:00', end: '02:00' }));
    expect(ics).toContain('DTSTART;TZID=Europe/Stockholm:20260703T220000');
    expect(ics).toContain('DTEND;TZID=Europe/Stockholm:20260704T020000');
  });

  it('marks cancelled events with STATUS:CANCELLED and a prefixed summary', () => {
    const ics = buildOne(baseEvent({ cancelled: true }));
    expect(ics).toContain('STATUS:CANCELLED');
    expect(ics).toContain('SUMMARY:CANCELLED: Friday Social');
  });

  it('uses STATUS:CONFIRMED for live events', () => {
    const ics = buildOne(baseEvent());
    expect(ics).toContain('STATUS:CONFIRMED');
    expect(ics).toContain('SUMMARY:Friday Social');
  });

  it('escapes commas, semicolons and backslashes in text fields', () => {
    const ics = buildOne(baseEvent({ title: 'Swing; Sway, & Spin\\Turn' }));
    expect(ics).toContain('SUMMARY:Swing\\; Sway\\, & Spin\\\\Turn');
  });

  it('includes the permalink in the description and a URL property', () => {
    const ics = buildOne(baseEvent());
    expect(ics).toContain('https://stockholmswing.com/event/chicago-friday/2026-07-03');
    expect(ics).toContain('URL:https://example.com/tickets');
  });

  it('truncates a long description body with an ellipsis', () => {
    const longBody = 'word '.repeat(200).trim();
    const ics = buildOne(baseEvent({ body: longBody }));
    // The full 1000-char body must not survive verbatim.
    expect(ics).not.toContain(longBody);
    expect(ics).toContain('…');
  });

  it('folds content lines longer than 75 octets', () => {
    const longBody = 'x'.repeat(200);
    const ics = buildOne(baseEvent({ body: longBody }));
    for (const line of ics.split('\r\n')) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });

  it('renders one VEVENT per event', () => {
    const ics = buildCalendar([baseEvent(), baseEvent({ id: 'x:2026-07-10', date: '2026-07-10' })], {
      siteUrl: SITE,
      now: new Date('2026-06-17T00:00:00Z'),
    });
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics.match(/END:VEVENT/g)).toHaveLength(2);
  });
});

describe('buildSingleEventCalendar', () => {
  const buildSingle = (e: SwingEvent) =>
    buildSingleEventCalendar(e, { siteUrl: SITE, now: new Date('2026-06-17T00:00:00Z') });

  it('wraps one event in a valid VCALENDAR', () => {
    const ics = buildSingle(baseEvent());
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics.match(/END:VEVENT/g)).toHaveLength(1);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('omits subscription-specific headers', () => {
    const ics = buildSingle(baseEvent());
    expect(ics).not.toContain('REFRESH-INTERVAL');
    expect(ics).not.toContain('X-PUBLISHED-TTL');
    expect(ics).not.toContain('X-WR-CALNAME');
  });

  it('includes the VTIMEZONE for Europe/Stockholm', () => {
    const ics = buildSingle(baseEvent());
    expect(ics).toContain('BEGIN:VTIMEZONE');
    expect(ics).toContain('TZID:Europe/Stockholm');
    expect(ics).toContain('END:VTIMEZONE');
  });

  it('uses the same UID scheme as the feed', () => {
    const ics = buildSingle(baseEvent());
    expect(ics).toContain('UID:chicago-friday:2026-07-03@stockholmswing.com');
  });

  it('uses CRLF line endings', () => {
    const ics = buildSingle(baseEvent());
    expect(ics).toContain('\r\n');
    expect(/[^\r]\n/.test(ics)).toBe(false);
  });

  it('rolls DTEND to the next day for overnight events', () => {
    const ics = buildSingle(baseEvent({ start: '22:00', end: '02:00' }));
    expect(ics).toContain('DTSTART;TZID=Europe/Stockholm:20260703T220000');
    expect(ics).toContain('DTEND;TZID=Europe/Stockholm:20260704T020000');
  });

  it('produces valid .ics when all optional fields are empty', () => {
    const minimal = baseEvent({
      band: undefined,
      dj: undefined,
      price: undefined,
      ticket: undefined,
      body: '',
      beginnerClass: undefined,
      neighborhood: undefined,
    });
    const ics = buildSingle(minimal);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('SUMMARY:Friday Social');
    expect(ics).toContain('LOCATION:Chicago Swing Dance Studio\\, Hornsgatan 75');
    // URL falls back to permalink when no ticket
    expect(ics).toContain('URL:https://stockholmswing.com/event/chicago-friday/2026-07-03');
  });

  it('handles Unicode characters in title and venue', () => {
    const ics = buildSingle(baseEvent({
      title: "Zinken's Rhythm Café — Balboa",
      venue: 'Språllan',
      address: 'Hälsingegatan 3',
    }));
    expect(ics).toContain("SUMMARY:Zinken's Rhythm Caf");
    expect(ics).toContain('LOCATION:Spr');
    // Structurally valid
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
  });

  it('escapes newlines in the body to iCal \\n', () => {
    const ics = buildSingle(baseEvent({ body: 'Line one\nLine two\nLine three' }));
    expect(ics).toContain('\\n');
    // No bare LF inside the VEVENT
    const vevent = ics.split('BEGIN:VEVENT')[1].split('END:VEVENT')[0];
    for (const line of vevent.split('\r\n')) {
      expect(line).not.toMatch(/[^\r]\n/);
    }
  });

  it('marks cancelled events correctly', () => {
    const ics = buildSingle(baseEvent({ cancelled: true }));
    expect(ics).toContain('STATUS:CANCELLED');
    expect(ics).toContain('SUMMARY:CANCELLED: Friday Social');
  });

  it('folds long lines to stay within 75-octet limit', () => {
    const ics = buildSingle(baseEvent({
      title: 'A '.repeat(50).trim(),
      body: 'B '.repeat(200).trim(),
    }));
    for (const line of ics.split('\r\n')) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });
});
