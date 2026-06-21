// Source: Swing Magnifique gig list (swingmagnifique.com/gigs).
//
// This is a **band-aggregator** source, not a venue. Swing Magnifique is a
// Django Reinhardt-style swing band that plays across multiple Stockholm
// venues. The gig list is a Bandzoogle calendar table:
//
//   <tr class="border-accent">
//     <td class="event-date">
//       <span class="date-long"><time class="from">
//         <span class="date">Wednesday, September 16</span>
//         @ <span class="time">6:30PM</span>
//       </time></span>
//     </td>
//     <td class="event-name">
//       <span class="text">Swing Magnifique / Georgian House</span>
//       <span class="text text-tertiary">Georgian House, Stockholm</span>
//     </td>
//     <td class="event-location">
//       <span class="text text-tertiary">Georgian House, Stockholm</span>
//     </td>
//   </tr>
//
// Dates have no year — resolved from a reference date (Stockholm-today in
// scrape(), fixed date in tests).
//
// Cross-venue: the VENUE_MAP maps location strings to venue_ids. Unknown
// venues are collected (not emitted) and surfaced via the `unknownVenues`
// property so the runner can report them.
//
// Swing-dedicated band → relevance: 'all', keep every gig.

import * as cheerio from 'cheerio';

export const id = 'swingmagnifique';
export const label = 'Swing Magnifique';
export const url = 'https://swingmagnifique.com/gigs';
export const relevance = 'all';

const BAND = 'Swing Magnifique';
const ORGANIZER = 'Swing Magnifique';

const VENUE_MAP = {
  'scalateatern':     'scala',
  'scala':            'scala',
  's:ta clara':       'staclara',
  'sta clara':        'staclara',
  'staclara':         'staclara',
  'bierhaus':         'staclara',
  'norrport':         'norrport',
  'chicago':          'chicago',
  'arstaliden':       'arstaliden',
};

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

const pad = (n) => String(n).padStart(2, '0');

function lookupVenue(locationText) {
  const lower = (locationText ?? '').toLowerCase().replace(/,\s*stockholm$/i, '').trim();
  for (const [key, venueId] of Object.entries(VENUE_MAP)) {
    if (lower.includes(key)) return venueId;
  }
  return null;
}

// "Wednesday, September 16" → { month, day }; null if unparseable.
function parseDateText(text) {
  const m = text.match(/(\w+)\s+(\d{1,2})/);
  if (!m) return null;
  const monthName = m[1].toLowerCase();
  const month = MONTHS[monthName];
  if (!month) return null;
  return { month, day: Number(m[2]) };
}

// "6:30PM" → "18:30"; "9:00PM" → "21:00"; "12:00PM" → "12:00"; "12:00AM" → "00:00"
function parseTime(text) {
  const m = (text ?? '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ampm = m[3].toUpperCase();
  if (h < 1 || h > 12 || min > 59) return null;
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${pad(h)}:${pad(min)}`;
}

function resolveYear(month, ref) {
  return month >= ref.month ? ref.year : ref.year + 1;
}

export function parse(html, refDate) {
  const ref = refDate ?? (() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  })();

  const $ = cheerio.load(html);
  const events = [];
  const unknownVenues = [];

  $('table tbody tr.border-accent').each((_, el) => {
    const row = $(el);

    const dateLong = row.find('td.event-date span.date-long span.date').first().text().trim();
    const parsed = parseDateText(dateLong);
    if (!parsed) return;

    const timeText = row.find('td.event-date span.date-long span.time').first().text().trim();
    const start = parseTime(timeText);
    if (!start) return;

    const eventName = row.find('td.event-name span.text').first().text().trim();
    if (!eventName) return;

    const locationText = row.find('td.event-location span.text').first().text().trim();
    const venueId = lookupVenue(locationText);

    const year = resolveYear(parsed.month, ref);
    const date = `${year}-${pad(parsed.month)}-${pad(parsed.day)}`;

    if (!venueId) {
      unknownVenues.push({ location: locationText, date, eventName });
      return;
    }

    events.push({
      id: `swingmagnifique-${venueId}-${date}`,
      name: eventName,
      style: 'all',
      venueId,
      date,
      start,
      end: '',
      music: 'live',
      band: BAND,
      organizer: ORGANIZER,
      url,
      description: '',
      status: 'live',
    });
  });

  events.unknownVenues = unknownVenues;
  return events;
}

export async function scrape() {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  const [y, m] = today.split('-').map(Number);
  const events = parse(await res.text(), { year: y, month: m });
  if (events.unknownVenues?.length) {
    console.warn(
      `⚠️ ${label}: ${events.unknownVenues.length} gig(s) at unknown venue(s) — need venues.csv rows:\n` +
      events.unknownVenues.map((v) => `  - "${v.location}" (${v.date})`).join('\n'),
    );
  }
  return events;
}
