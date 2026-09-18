// Source: Chicago Swing Dance Studio events (chicago75.se/evenemang).
//
// The listing page is a CMS slider that shows upcoming events with titles and
// dates ("Onsdag 17/6") but no times. Times live on individual event pages,
// in the meta description: "Mellan 19:00 – 23:00 är vi stolta att presentera…"
//
// Each event page also carries a labelled facts panel (Datum / Tid / Pris) and
// a rich-text blurb. Price and description are read from there — they are
// published as structured fields, so per the project's first principle they
// belong in their columns rather than being left for a human to retype.
//
// Architecture: scrape() fetches the listing to discover event page URLs, then
// fetches each event page; parse() operates on a single event page so the
// fixture test can verify all field extraction without network.
//
// Chicago is a swing-dedicated venue → relevance: 'all', keep everything.

import * as cheerio from 'cheerio';

export const id = 'chicago';
export const label = 'Chicago Swing Dance Studio';
export const url = 'https://www.chicago75.se/evenemang';
export const relevance = 'all';

const VENUE_ID = 'chicago';
const ORGANIZER = 'Chicago Swing Dance Studio';
const BASE = 'https://www.chicago75.se';

const pad = (n) => String(n).padStart(2, '0');

// Extract publication year + month from the Webflow "Last Published" HTML comment.
// All pages embed this: "<!-- Last Published: Mon Jun 01 2026 13:14:01 GMT+0000 -->"
// Using this makes date resolution deterministic on the same HTML, so fixture
// tests don't depend on when they run.
function publishedAt(html) {
  const m = html.match(/Last Published:\s*\w+\s+\w+\s+\d{1,2}\s+(\d{4})/);
  if (m) {
    // Re-parse the full date string to get the month too.
    const dm = html.match(/Last Published:\s*(\w+ \w+ \d{1,2} \d{4})/);
    if (dm) {
      const d = new Date(dm[1]);
      if (!isNaN(d)) return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }
    return { year: Number(m[1]), month: 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

// "13/6" + { year:2026, month:6 } → "2026-06-13".
// If the event month is before the published month, the event is next year.
function resolveDate(str, pub) {
  const m = str.match(/(\d{1,2})\/(\d{1,2})/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = month >= pub.month ? pub.year : pub.year + 1;
  return `${year}-${pad(month)}-${pad(day)}`;
}

// "Mellan 19:00 – 23:00 är vi stolta att presentera…" → { start, end }
function parseMetaTime(content) {
  const m = (content ?? '').match(/Mellan\s+(\d{2}:\d{2})\s*[–\-]\s*(\d{2}:\d{2})/);
  if (!m) return null;
  return { start: m[1], end: m[2] };
}

// Webflow pads rich text with invisible filler characters. Strip those and
// collapse whitespace so a blurb round-trips through CSV as one clean line.
const INVISIBLE = /[\u200b\u200c\u200d\u2060\ufeff\u00a0]/g;
const clean = (s) => (s ?? '').replace(INVISIBLE, ' ').replace(/\s+/g, ' ').trim();

// DATA.md description hygiene: the structured date is the date, so a stray
// "Lördag 13/6" in the prose gets stripped rather than shipped.
const DATE_IN_PROSE =
  /\s*\b(?:(?:mån|tis|ons|tors|fre|lör|sön)dagen?\s+)?\d{1,2}\/\d{1,2}(?:\s+\d{4})?\b/gi;

// The event template renders a small facts panel of label/value pairs:
// "Datum" / "Lördag 13/6", "Tid" / "20:00 – 23:00", "Pris" / "200 kr (150 kr
// för rabatterade)". Labels are matched on their own text, not on the
// Webflow-generated class name, which is not stable across template edits.
function factValue($, label) {
  const cell = $('div')
    .filter((_, el) => {
      const $el = $(el);
      return $el.children().length === 0 && $el.text().trim() === label;
    })
    .first();
  return clean(cell.next().text());
}

// The rich-text body is the organizer's blurb. Two pieces of chrome come off:
// a leading line repeating the event title, and the studio sign-off that
// closes every post.
function parseDescription($, name) {
  const $body = $('.w-richtext').first();
  if (!$body.length) return '';

  // A <br> inside a paragraph separates two logical lines; treat it as one.
  $body.find('br').replaceWith('\n');

  const lines = $body
    .find('p')
    .toArray()
    .flatMap((el) => $(el).text().split('\n'))
    .map(clean)
    .filter(Boolean)
    .filter((line) => line.toLowerCase() !== clean(name).toLowerCase())
    .filter((line) => !/^chicago swing dance studio$/i.test(line));

  return clean(lines.join(' ').replace(DATE_IN_PROSE, ''));
}

/**
 * Parse one Chicago event page HTML → CandidateEvent[]. Pure — no network.
 * Returns a single-element array on success, [] if the page can't be parsed.
 */
export function parse(html) {
  const $ = cheerio.load(html);

  const name = $('h1.heading-style-h2').first().text().trim();
  if (!name) return [];

  const metaDesc = $('meta[name="description"]').attr('content') ?? '';
  const time = parseMetaTime(metaDesc);
  if (!time) return [];

  const dateRaw = $('.blogpost5_meta-wrapper .text-weight-semibold').first().text().trim()
    || $('title').text().trim();
  const pub = publishedAt(html);
  const date = resolveDate(dateRaw, pub);
  if (!date) return [];

  // Build the canonical event URL from Webflow's item slug attribute.
  const slug = $('html').attr('data-wf-item-slug');
  const eventUrl = slug ? `${BASE}/evenemang/${slug}` : url;

  // "DJs The Hot Shots" → music:'dj', dj:'The Hot Shots'
  // "DJ-kväll"         → music:'dj', no dj name (no space after DJs?)
  const djMatch = /\bDJs?\s+(.+)/i.exec(name);
  const music = djMatch || /\bDJs?\b/i.test(name) ? 'dj' : 'live';
  const dj = djMatch?.[1].trim();

  // "Chicago Live Wednesdays - Hällgren's Lucky Quartet" → band:"Hällgren's Lucky Quartet"
  const isLiveWednesdays = music === 'live' && /^Chicago Live Wednesdays\b/.test(name);
  const bandMatch = isLiveWednesdays ? /^Chicago Live Wednesdays\s*-\s*(.+)$/.exec(name) : null;
  const band = bandMatch?.[1].trim();

  // Chicago Live Wednesdays always runs a beginner drop-in at the door, same time as doors.
  const beginnerClass = isLiveWednesdays ? time.start : undefined;

  return [{
    id: `${VENUE_ID}-${date}`,
    name,
    style: 'all',
    venueId: VENUE_ID,
    date,
    start: time.start,
    end: time.end,
    music,
    dj,
    band,
    beginnerClass,
    price: factValue($, 'Pris'),
    organizer: ORGANIZER,
    url: eventUrl,
    description: parseDescription($, name),
    status: 'live',
  }];
}

export async function scrape() {
  const listRes = await fetch(url, { redirect: 'follow' });
  if (!listRes.ok) throw new Error(`${label}: HTTP ${listRes.status}`);
  const listHtml = await listRes.text();

  // Extract event page paths from the listing CMS slider.
  const $ = cheerio.load(listHtml);
  const paths = new Set();
  $('a.blog66_title-link, a.blog66_image-link').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (href.startsWith('/evenemang/')) paths.add(href);
  });

  if (paths.size === 0) return [];

  const results = await Promise.all([...paths].map(async (p) => {
    try {
      const res = await fetch(`${BASE}${p}`, { redirect: 'follow' });
      if (!res.ok) return [];
      return parse(await res.text());
    } catch {
      return [];
    }
  }));

  return results.flat();
}
