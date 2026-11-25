// Source: S:ta Clara Bierhaus live-music calendar (staclara.se/calendar.html).
//
// The Stockholm venue lives on stockholm.staclara.se (the www. root is now just
// a venue picker). The page is a list of <calendar-entry> blocks under a month
// <h2>; each entry carries its data as JSON in an inline <script>:
//
//   <h2>NOVEMBER 2026</h2>
//   <calendar-entry>
//     <script type="application/json">
//       {"date": "Thu 19", "content": "<p>\nPETER B&K BAND 19-22\n<BR>\nFive Horn Jazz Band!\n</p>", ...}
//     </script>
//   </calendar-entry>
//
// S:ta Clara is a jazz/blues pub, so most nights aren't swing dance — and even
// the jazz nights are often listening acts, not danceable swing. It declares
// relevance 'roster': the runner cuts obvious non-music noise, then trusts by
// band against data/bands.csv. Unknown acts are surfaced for vetting, never
// auto-added. (A swing-dedicated venue would declare 'all' and keep everything.)

import * as cheerio from 'cheerio';
import { titleCase } from '../lib/candidate.mjs';

export const id = 'staclara';
export const label = 'S:ta Clara Bierhaus';
export const url = 'https://stockholm.staclara.se/calendar.html';
export const relevance = 'roster';

const VENUE_ID = 'staclara';
const ORGANIZER = 'S:ta Clara Bierhaus';

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const pad = (n) => String(n).padStart(2, '0');

// "JUNE 2026" -> { month: 6, year: 2026 }; null if unparseable.
function parseMonthHeader(text) {
  const m = text.trim().toLowerCase().match(/([a-zà-ö]+)\s+(\d{4})/);
  if (!m) return null;
  const month = MONTHS[m[1].slice(0, 3)];
  if (!month) return null;
  return { month, year: Number(m[2]) };
}

// "19-22" -> {start:'19:00', end:'22:00'}; "20-00" -> 20:00/00:00. null if none.
function parseTimeRange(text) {
  const m = text.match(/\b(\d{1,2})\s*-\s*(\d{1,2})\b/);
  if (!m) return null;
  const sh = Number(m[1]);
  const eh = Number(m[2]);
  if (sh > 23 || eh > 23) return null;
  return { start: `${pad(sh)}:00`, end: `${pad(eh)}:00` };
}

/**
 * Parse the calendar HTML into CandidateEvent[]. Pure — no network — so it's
 * driven by the saved fixture in tests.
 */
export function parse(html) {
  const $ = cheerio.load(html);
  const events = [];
  let ctx = null; // current { month, year } from the latest <h2>

  $('h2, calendar-entry').each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    if (tag === 'h2') {
      ctx = parseMonthHeader($(el).text()) ?? ctx;
      return;
    }
    if (!ctx) return;

    let entry;
    try {
      entry = JSON.parse($(el).find('script[type="application/json"]').first().html() ?? '');
    } catch {
      return; // malformed entry — skip it rather than fail the whole source
    }

    const dayMatch = String(entry?.date ?? '').match(/(\d{1,2})/); // "Thu 19"
    if (!dayMatch) return;
    const day = Number(dayMatch[1]);
    const date = `${ctx.year}-${pad(ctx.month)}-${pad(day)}`;

    // First line (before <BR>) carries the act + time; the rest is genre.
    const [firstRaw, ...restRaw] = String(entry.content ?? '').split(/<br\s*\/?>/i);
    const firstLine = cheerio.load(firstRaw).text().replace(/\s+/g, ' ').trim();
    const genre = cheerio
      .load(restRaw.join(' '))
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    const time = parseTimeRange(firstLine);
    if (!time) return; // "TBC", no time -> nothing bookable yet

    // Strip a leading "Wed 3 - " style prefix and the time token to get the act.
    const title = firstLine
      .replace(/^(mon|tue|wed|thu|fri|sat|sun)[a-z]*\s+\d{1,2}\s*-\s*/i, '')
      .replace(/\b\d{1,2}\s*-\s*\d{1,2}\b.*$/, '')
      .trim();
    if (!title) return;
    if (/^(tbc|tba|tbd)\b/i.test(title)) return; // "to be confirmed" placeholder

    // No relevance filtering here — the runner applies it per the declared
    // `relevance` policy. The parser's job is to extract, not to judge.
    events.push({
      id: `${VENUE_ID}-${date}`,
      name: titleCase(title),
      style: 'all',
      venueId: VENUE_ID,
      date,
      start: time.start,
      end: time.end,
      music: 'live',
      band: titleCase(title),
      organizer: ORGANIZER,
      url,
      description: genre,
      status: 'live',
    });
  });

  return events;
}

export async function scrape() {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
  return parse(await res.text());
}
