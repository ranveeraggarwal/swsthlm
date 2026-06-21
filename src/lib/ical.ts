// iCalendar (RFC 5545) feed generation for the ICS subscription feature (#8).
//
// Pure, universal: fed a list of SwingEvents, returns a VCALENDAR string. No
// I/O — the route handler does the data loading and serves the result.
//
// Times: event start/end are Europe/Stockholm *wall-clock* strings and are
// emitted as local times tagged `TZID=Europe/Stockholm`, with a VTIMEZONE
// component carrying the CET/CEST DST rules. Clients apply the rules
// themselves, so a 20:00 social shows as 20:00 whether it falls in summer or
// winter — no hardcoded offsets, correct across both DST boundaries.

import type { SwingEvent } from '@/types/event';
import { addDays } from '@/lib/data/expand';

const TZID = 'Europe/Stockholm';
const PRODID = '-//Stockholm Swing//Dance Calendar//EN';
const CALNAME = 'Stockholm Swing Dance Calendar';
const CALDESC =
  'Lindy Hop, Balboa, Shag, and Blues social dancing in Stockholm. Updated automatically.';

// Keep the description compact — calendar apps show it in tight popovers.
const DESCRIPTION_BODY_MAX = 300;

// Europe/Stockholm: CET (+01:00) / CEST (+02:00), EU DST rule — clocks go
// forward the last Sunday of March (02:00→03:00) and back the last Sunday of
// October (03:00→02:00). Static; the RRULEs encode the rule for all years.
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${TZID}`,
  'BEGIN:DAYLIGHT',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'END:STANDARD',
  'END:VTIMEZONE',
];

/** Format a YYYY-MM-DD + HH:MM wall time as a floating local stamp: YYYYMMDDTHHMMSS. */
function formatLocal(dateISO: string, time: string): string {
  return `${dateISO.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

/** Format an absolute Date as an iCal UTC timestamp: YYYYMMDDTHHMMSSZ. */
function formatUtc(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Escape a value for an iCal TEXT field (RFC 5545 §3.3.11). */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
}

/** Truncate to `max` chars on a word boundary, appending an ellipsis. */
function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd() + '…';
}

/**
 * Fold a content line to <=75 octets per RFC 5545 §3.1, continuation lines
 * prefixed with a single space. We fold on UTF-16 code units, which is safe for
 * the ASCII-dominant content here and keeps multi-byte characters intact by
 * never splitting below the byte budget for our inputs.
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  // First line: 75 chars. Continuations: leading space + 74 chars.
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    parts.push(' ' + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return parts.join('\r\n');
}

/** A single VEVENT block. Returns its content lines (unfolded). */
function buildEvent(event: SwingEvent, dtstamp: string, siteUrl: string): string[] {
  const sourceId = event.id.split(':')[0];
  // Stable per-occurrence UID, mirroring the permalink/JSON-LD identity so
  // updates modify the existing entry instead of duplicating it.
  const uid = `${event.id}@stockholmswing.com`;

  const dtStart = formatLocal(event.date, event.start);
  // Overnight events (end <= start) finish on the following calendar day.
  const endDate = event.end <= event.start ? addDays(event.date, 1) : event.date;
  const dtEnd = formatLocal(endDate, event.end);

  const permalink = `${siteUrl}/event/${sourceId}/${event.date}`;

  // Description: structured facts first, then a truncated free-text body, then
  // the canonical link back to the event page.
  const descParts: string[] = [];
  if (event.organizer) descParts.push(`Organizer: ${event.organizer}`);
  if (event.band) descParts.push(`Live music: ${event.band}`);
  if (event.dj) descParts.push(`DJ: ${event.dj}`);
  if (event.price) descParts.push(`Price: ${event.price}`);
  if (event.beginnerClass) descParts.push(`Beginner class: ${event.beginnerClass}`);
  if (event.body) descParts.push('', truncate(event.body, DESCRIPTION_BODY_MAX));
  descParts.push('', `Details: ${permalink}`);
  const description = descParts.join('\n');

  const location = [event.venue, event.address].filter(Boolean).join(', ');

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${TZID}:${dtStart}`,
    `DTEND;TZID=${TZID}:${dtEnd}`,
    `SUMMARY:${escapeText(event.cancelled ? `CANCELLED: ${event.title}` : event.title)}`,
  ];
  if (location) lines.push(`LOCATION:${escapeText(location)}`);
  lines.push(`DESCRIPTION:${escapeText(description)}`);
  lines.push(`URL:${escapeText(event.ticket || permalink)}`);
  lines.push(`STATUS:${event.cancelled ? 'CANCELLED' : 'CONFIRMED'}`);
  lines.push('END:VEVENT');
  return lines;
}

/**
 * Build the full VCALENDAR document for the given events.
 *
 * @param events  Occurrences to publish (already expanded + merged).
 * @param opts.siteUrl  Absolute site origin, e.g. "https://stockholmswing.com".
 * @param opts.now      Build instant; defaults to `new Date()`. Injectable for tests.
 */
export function buildCalendar(
  events: SwingEvent[],
  opts: { siteUrl: string; now?: Date }
): string {
  const dtstamp = formatUtc(opts.now ?? new Date());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(CALNAME)}`,
    `X-WR-CALDESC:${escapeText(CALDESC)}`,
    `X-WR-TIMEZONE:${TZID}`,
    // Hint to clients to re-poll the feed twice a day.
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
    ...VTIMEZONE,
  ];

  for (const event of events) {
    lines.push(...buildEvent(event, dtstamp, opts.siteUrl));
  }

  lines.push('END:VCALENDAR');

  // CRLF line endings (RFC 5545 §3.1), with long lines folded.
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
