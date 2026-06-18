// Source: Norrport live-music calendar (norrport.se/kalender/).
//
// The page is a grid of `.np-grid-card` divs, each containing:
//   - a title in `h3.np-grid-title > a` ("Old Boy Stompers | Norrport Live")
//   - a meta line in `p.np-grid-meta` ("📅 Torsdag 18 juni kl 19:00 - 22:00")
//   - a booking button whose onclick carries the ISO date:
//       openBookingForEvent('2026-06-18', …)
//   - an event detail link in the title anchor
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

function parseTimeRange(text) {
  const m = text.match(/kl\s+(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const sh = Number(m[1]);
  const sm = Number(m[2]);
  const eh = Number(m[3]);
  const em = Number(m[4]);
  if (sh > 23 || eh > 23 || sm > 59 || em > 59) return null;
  return { start: `${pad(sh)}:${pad(sm)}`, end: `${pad(eh)}:${pad(em)}` };
}

function extractBand(title) {
  let name = title.split('|')[0].trim()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
  name = name.replace(/\s*(live\s+)?(at|på)\s+norrport!?\s*$/i, '');
  name = name.replace(/^konsert\s+med\s+/i, '');
  return name.trim();
}

export function parse(html) {
  const $ = cheerio.load(html);
  const events = [];

  $('.np-grid-card').each((_, el) => {
    const card = $(el);

    const bookBtn = card.find('button.np-grid-btn-book');
    if (!bookBtn.length) return;
    const onclick = bookBtn.attr('onclick') ?? '';
    const dateMatch = onclick.match(/openBookingForEvent\('(\d{4}-\d{2}-\d{2})'/);
    if (!dateMatch) return;
    const date = dateMatch[1];

    const meta = card.find('p.np-grid-meta').text();
    const time = parseTimeRange(meta);
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
