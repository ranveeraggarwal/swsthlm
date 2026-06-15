// Source: Chicago Swing Dance Studio events (chicago75.se/evenemang).
//
// The listing page is a CMS slider that shows upcoming events with titles and
// dates ("Onsdag 17/6") but no times. Times live on individual event pages,
// in the meta description: "Mellan 19:00 – 23:00 är vi stolta att presentera…"
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
    organizer: ORGANIZER,
    url: eventUrl,
    description: '',
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
