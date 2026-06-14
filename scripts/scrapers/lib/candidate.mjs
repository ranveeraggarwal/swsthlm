// Shared shape + helpers for scraped events. A source parser returns
// CandidateEvent[]; the runner turns each into a oneoffs.csv row, dedupes, and
// writes. Keeping the column order and row mapping here means every source
// emits identically-shaped rows.

import Papa from 'papaparse';

// Column order of data/oneoffs.csv. The runner formats rows against this so a
// scraped line is byte-shaped like a hand-written one.
export const ONEOFF_FIELDS = [
  'id', 'name', 'style', 'venue_id', 'date', 'end_date', 'start', 'end',
  'price', 'payment', 'beginner_class', 'music', 'dj', 'band', 'organizer',
  'url', 'description', 'status',
];

/**
 * @typedef {Object} CandidateEvent
 * @property {string} id          deterministic, stable across runs (`<venue>-<date>`)
 * @property {string} name
 * @property {string} style       'lindy-hop' | 'balboa' | 'blues' | 'shag' | 'all'
 * @property {string} venueId
 * @property {string} date        YYYY-MM-DD
 * @property {string} start       HH:MM
 * @property {string} end         HH:MM
 * @property {string} music       'live' | 'dj' | 'mixed'
 * @property {string} organizer
 * @property {string} url
 * @property {string} [band]
 * @property {string} [dj]
 * @property {string} [price]
 * @property {string} [description]
 */

// Uppercase source text -> display case. "JESSES JAZZ BAND" -> "Jesses Jazz Band".
export function titleCase(str) {
  return (str ?? '')
    .toLowerCase()
    .replace(/\b([a-zà-ö])/g, (m) => m.toUpperCase())
    .trim();
}

// CandidateEvent -> a plain row object keyed by ONEOFF_FIELDS. Structured fields
// the scraper can't know (price/dj/beginner_class…) are left empty for a human
// to fill on review — never guessed into prose.
export function candidateToRow(c) {
  return {
    id: c.id,
    name: c.name,
    style: c.style,
    venue_id: c.venueId,
    date: c.date,
    end_date: c.endDate ?? '',
    start: c.start,
    end: c.end,
    price: c.price ?? '',
    payment: c.payment ?? '',
    beginner_class: c.beginnerClass ?? '',
    music: c.music,
    dj: c.dj ?? '',
    band: c.band ?? '',
    organizer: c.organizer,
    url: c.url,
    description: c.description ?? '',
    status: c.status ?? 'live',
  };
}

// Format one row object as a single CSV line, quoted exactly like Papa writes
// the rest of the file. No trailing newline.
export function formatRow(row) {
  return Papa.unparse([row], { header: false, columns: ONEOFF_FIELDS });
}
