// Source: Norrport live-music calendar (norrport.se/kalender/).
//
// The page is a grid of `.np-grid-card` divs, each containing:
//   - a title in `h3.np-grid-title > a` ("Old Boy Stompers! 🎉| Norrport Live")
//   - a meta line in `p.np-grid-meta` ("📅 Torsdag 29 okt kl 19:00")
//   - a booking button whose `data-date` carries the ISO date:
//       <button class="np-grid-btn-book" data-date="2026-10-29" …>
//   - an event detail link in the title anchor
//
// The meta line carries a start time and, only sometimes, an end ("kl 19:00 -
// 22:00"). Most nights list the start alone, and `end` is required downstream
// (the ICS feed and JSON-LD both compute from it), so a missing end is filled
// with the venue's usual slot — see SLOT_HOURS.
//
// Cards without a booking button (STÄNGT/closed days) are skipped.
// Hidden cards (np-hidden-grid, behind "load more") are real future events.
//
// Norrport is a mixed venue (karaoke, quiz, live bands) → relevance: 'roster'.
// The runner cuts non-music noise, then trusts by band against data/bands.csv.

import * as cheerio from 'cheerio';

export const id = 'norrport';
export const label = 'Norrport';
export const url = 'https://norrport.se/kalender/';
export const relevance = 'roster';

const VENUE_ID = 'norrport';
const ORGANIZER = 'Norrport';

const pad = (n) => String(n).padStart(2, '0');

// Norrport's shows run three hours: every Norrport row in oneoffs.csv is
// 19:00–22:00 or 20:00–23:00. Used only when the card gives a start alone.
const SLOT_HOURS = 3;

// "… kl 19:00" or "… kl 19:00 - 22:00" -> { start, end }. When the card has no
// end, `end` is start + SLOT_HOURS (wrapping past midnight, which the data
// contract allows). null if there is no valid start time.
function parseTimes(text) {
  const m = text.match(/kl\s+(\d{1,2}):(\d{2})(?:\s*[-–]\s*(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const sh = Number(m[1]);
  const sm = Number(m[2]);
  if (sh > 23 || sm > 59) return null;
  const start = `${pad(sh)}:${pad(sm)}`;
  if (m[3] === undefined) {
    return { start, end: `${pad((sh + SLOT_HOURS) % 24)}:${pad(sm)}` };
  }
  const eh = Number(m[3]);
  const em = Number(m[4]);
  if (eh > 23 || em > 59) return null;
  return { start, end: `${pad(eh)}:${pad(em)}` };
}

function extractBand(title) {
  let name = title.split('|')[0]
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
  name = name.replace(/\s*(live\s+)?(at|på)\s+norrport!?\s*$/i, '');
  name = name.replace(/^konsert\s+med\s+/i, '');
  // Decorative trailing punctuation: "Old Boy Stompers! 🎉", "Selander Quartet:".
  return name.replace(/[\s!:]+$/, '').trim();
}

export function parse(html) {
  const $ = cheerio.load(html);
  const events = [];

  $('.np-grid-card').each((_, el) => {
    const card = $(el);

    const bookBtn = card.find('button.np-grid-btn-book');
    if (!bookBtn.length) return;
    const date = bookBtn.attr('data-date') ?? '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

    const meta = card.find('p.np-grid-meta').text();
    const time = parseTimes(meta);
    if (!time) return;

    const titleEl = card.find('h3.np-grid-title a').first();
    const title = titleEl.text().trim();
    if (!title) return;

    const eventUrl = titleEl.attr('href') ?? url;
    const band = extractBand(title);
    if (!band) return;

    events.push({
      id: `${VENUE_ID}-${date}`,
      name: band,
      style: 'all',
      venueId: VENUE_ID,
      date,
      start: time.start,
      end: time.end,
      music: 'live',
      band,
      organizer: ORGANIZER,
      url: eventUrl,
      description: '',
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
