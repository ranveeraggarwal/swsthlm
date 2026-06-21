// Source: Årstaliden Lindy hop social dance nights (arstablick.com/Lindyhop.html).
//
// The page is a static list of dates inside <li> elements:
//   "Fredag den 15/5"  (nested <li>: "kl 18 - 22 Social dans")
//
// Dates are day/month only. The page always mentions the season's year in its
// prose ("sommaren 2026"), so year resolution extracts the highest year from
// the page text. Fallback: refDate.year (Stockholm-today in scrape(), fixed in
// tests). The past filter in the runner handles expired events.
//
// Årstaliden is a Lindy hop dedicated venue → relevance: 'all', keep everything.

import * as cheerio from 'cheerio';

export const id = 'arstaliden';
export const label = 'Årstaliden';
export const url = 'https://arstablick.com/Lindyhop.html';
export const relevance = 'all';

const VENUE_ID = 'arstaliden';
const ORGANIZER = 'Årstaliden';

const pad = (n) => String(n).padStart(2, '0');

function parseTimeRange(text) {
  const m = text.match(/kl\s+(\d{1,2})\s*[-–]\s*(\d{1,2})/);
  if (!m) return null;
  const sh = Number(m[1]);
  const eh = Number(m[2]);
  if (sh > 23 || eh > 23) return null;
  return { start: `${pad(sh)}:00`, end: `${pad(eh)}:00` };
}

// Extract the events' year from page text. The page says things like
// "sommaren 2026" — take the highest 20xx year mentioned.
function extractYear(text) {
  const years = [...text.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
  return years.length ? Math.max(...years) : null;
}

export function parse(html, refDate) {
  const ref = refDate ?? (() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  })();

  const $ = cheerio.load(html);
  const pageText = $.text();
  const year = extractYear(pageText) ?? ref.year;

  const events = [];
  const seen = new Set();

  $('li').each((_, el) => {
    const li = $(el);
    const text = li.clone().children('ul').remove().end().text().trim();

    const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})/);
    if (!dateMatch) return;
    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return;

    const nested = li.find('li').first().text().trim();
    const allText = `${text} ${nested}`;
    const time = parseTimeRange(allText);
    if (!time) return;

    const date = `${year}-${pad(month)}-${pad(day)}`;

    if (seen.has(date)) return;
    seen.add(date);

    events.push({
      id: `${VENUE_ID}-${date}`,
      name: 'Lindyhop i Årsta',
      style: 'lindy-hop',
      venueId: VENUE_ID,
      date,
      start: time.start,
      end: time.end,
      music: 'dj',
      organizer: ORGANIZER,
      url,
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
