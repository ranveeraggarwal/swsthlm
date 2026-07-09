// Google Form -> PR sync (issue #5). Polls the organizer-intake form's
// responses sheet (published to the web as CSV — no service account, no
// secrets, same "no secrets" shape as the nightly scraper) and turns new
// submissions into data/oneoffs.csv rows on a fixed review branch.
//
//   node scripts/form-sync.mjs            # apply changes + write form-sync-report.md
//   node scripts/form-sync.mjs --dry-run  # report only, write nothing
//
// Requires FORM_RESPONSES_CSV_URL (env var) — the "Publish to web" CSV URL
// for the responses sheet. See docs/architecture/FORM_SYNC.md for setup.
//
// Design mirrors scripts/scrape.mjs:
//  - Rows are proposed as `status=draft` (never `live` — a human promotes it).
//  - Every proposed id is deterministic (`slug(name)-date`), so a rerun before
//    the previous PR is merged reproduces the same rows — idempotent, no
//    separate "seen" state needed. Once merged into main, the id already
//    exists there and is skipped on the next run.
//  - Never invents a venue: an unrecognized "Venue" answer is flagged for a
//    human, not silently created.
//  - Never guesses unknowable fields: unparseable dates/times, or a missing
//    required field, are flagged and the row is left out of the diff.
//  - Corrections ("Is this a correction to an existing listing?") are never
//    auto-applied to an existing row — that risks silently mutating the wrong
//    listing. They're surfaced in the report for the maintainer to apply.
//  - Surgical text write: append-only to oneoffs.csv, same as the scraper.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import { validateData } from './validate-data.mjs';
import { formatRow } from './scrapers/lib/candidate.mjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const ONEOFFS_PATH = path.join(DATA_DIR, 'oneoffs.csv');
const REPORT_PATH = path.join(process.cwd(), 'form-sync-report.md');
const DRY_RUN = process.argv.includes('--dry-run');

const STYLES = new Set(['lindy-hop', 'balboa', 'blues', 'shag', 'all']);
const MUSIC = new Set(['live', 'dj', 'mixed']);

const slugify = (str) =>
  (str ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// "8/15/2026", "15/08/2026", "2026-08-15", "August 15, 2026" -> "2026-08-15".
// European (day-first) is preferred for the ambiguous D/M vs M/D case, since
// the form serves Swedish organizers — matches docs/DATA.md's YYYY-MM-DD
// convention once parsed. Returns null (never a guessed-wrong date) if the
// shape is unrecognized.
export function parseFormDate(raw) {
  const s = (raw ?? '').trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return toIso(iso[1], iso[2], iso[3]);

  const slash = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (slash) {
    const [, a, b, year] = slash;
    const an = Number(a);
    const bn = Number(b);
    // Unambiguous cases first: whichever side is >12 must be the day.
    if (an > 12 && bn <= 12) return toIso(year, b, a);
    if (bn > 12 && an <= 12) return toIso(year, a, b);
    if (an <= 12 && bn <= 12) return toIso(year, b, a); // ambiguous -> day-first
    return null;
  }

  const named = s.match(/^([a-zà-ö]+)\s+(\d{1,2}),?\s+(\d{4})$/i)
    || s.match(/^(\d{1,2})\s+([a-zà-ö]+)\s+(\d{4})$/i);
  if (named) {
    const monthName = /^\d/.test(named[1]) ? named[2] : named[1];
    const day = /^\d/.test(named[1]) ? named[1] : named[2];
    const month = MONTH_NAMES[monthName.slice(0, 3).toLowerCase()];
    if (!month) return null;
    return toIso(named[3], month, day);
  }

  return null;
}

const MONTH_NAMES = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function toIso(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || !m || m > 12 || m < 1 || !d || d > 31 || d < 1) return null;
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null;
  return iso;
}

// "19:00", "19:00:00", "7:00 PM", "7 PM" -> "19:00". null if unrecognized.
export function parseFormTime(raw) {
  const s = (raw ?? '').trim();
  if (!s) return null;
  const ampm = s.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?$/i);
  if (ampm) {
    let h = Number(ampm[1]) % 12;
    if (ampm[3].toLowerCase() === 'p') h += 12;
    const min = ampm[2] ?? '00';
    return `${String(h).padStart(2, '0')}:${min}`;
  }
  const h24 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (h24) {
    const h = Number(h24[1]);
    const min = Number(h24[2]);
    if (h > 23 || min > 59) return null;
    return `${String(h).padStart(2, '0')}:${h24[2]}`;
  }
  return null;
}

const norm = (s) => (s ?? '').trim().toLowerCase();

// Dance Style answer -> style enum. Defaults to 'all' (the safe "social, all
// styles welcome" fallback) when the answer doesn't match a known style, so
// the row still passes validation — the human reviewing the draft PR corrects
// it if the guess is wrong.
function mapStyle(raw, notes) {
  const v = norm(raw);
  if (!v) { notes.push('style: no answer, defaulted to "all"'); return 'all'; }
  if (v.includes('lindy')) return 'lindy-hop';
  if (v.includes('balboa')) return 'balboa';
  if (v.includes('blues')) return 'blues';
  if (v.includes('shag')) return 'shag';
  if (STYLES.has(v)) return v;
  notes.push(`style: unrecognized answer "${raw}", defaulted to "all"`);
  return 'all';
}

// Music answer -> music enum. Falls back to whichever of band/DJ was actually
// filled in when the answer itself doesn't parse, rather than guessing blind.
function mapMusic(raw, { band, dj }, notes) {
  const v = norm(raw);
  if (v.includes('live') || v.includes('band')) return 'live';
  if (v.includes('both') || v.includes('mixed')) return 'mixed';
  if (v.includes('dj')) return 'dj';
  if (MUSIC.has(v)) return v;
  if (band) { notes.push(`music: unrecognized answer "${raw}", inferred "live" (band name given)`); return 'live'; }
  if (dj) { notes.push(`music: unrecognized answer "${raw}", inferred "dj" (DJ name given)`); return 'dj'; }
  notes.push(`music: unrecognized answer "${raw}", defaulted to "dj"`);
  return 'dj';
}

function mapBeginnerClass(hasClassRaw, startTimeRaw, notes) {
  const time = parseFormTime(startTimeRaw);
  if (time) return time;
  if (startTimeRaw?.trim()) notes.push(`beginner class start time "${startTimeRaw}" unparseable, dropped`);
  return /^y/i.test((hasClassRaw ?? '').trim()) ? 'yes' : '';
}

// Venue answer -> venue_id, by matching against data/venues.csv `name` column
// (case/whitespace-insensitive). Never invents a venue: an unmatched answer
// comes back null, and the caller flags it for a human rather than writing a
// venue_id that doesn't exist. The "Other" free-text name is checked against
// venues.csv too — the form's dropdown can lag behind venues.csv, so an
// organizer picking "Other" may still be naming a venue that already exists.
function resolveVenue(raw, otherName, otherAddress, otherNeighborhood, venues) {
  const v = norm(raw);
  if (v && v !== 'other') {
    const hit = venues.rows.find((r) => norm(r.name) === v);
    if (hit) return { venueId: hit.id, proposal: null };
  }
  if (otherName?.trim()) {
    const hit = venues.rows.find((r) => norm(r.name) === norm(otherName));
    if (hit) return { venueId: hit.id, proposal: null };
    return {
      venueId: null,
      proposal: { name: otherName.trim(), address: otherAddress?.trim() ?? '', neighborhood: otherNeighborhood?.trim() ?? '' },
    };
  }
  return { venueId: null, proposal: null };
}

/**
 * Map one parsed CSV row (Google Forms response, keyed by question text) into
 * either a oneoffs.csv row candidate or a set of reasons it can't be written
 * yet. Pure — no network, no fs — so it's the unit under test.
 *
 * @returns {{ row?: object, correction?: object, issues: string[] }}
 */
export function mapResponse(response, venues) {
  const g = (col) => (response[col] ?? '').trim();
  const issues = [];
  const notes = [];

  const isCorrection = /^y/i.test(g('Is this a correction to an existing listing?'));
  if (isCorrection) {
    return {
      correction: {
        name: g('Event Name'),
        organizer: g('Organizer Name'),
        reference: g('If yes, which event?'),
        timestamp: g('Timestamp'),
        raw: response,
      },
      issues: [],
    };
  }

  const name = g('Event Name');
  if (!name) issues.push('missing Event Name');

  const date = parseFormDate(g('Start Date'));
  if (!date) issues.push(`Start Date "${g('Start Date')}" is missing or unparseable`);
  const endDateRaw = g('End Date');
  const endDate = endDateRaw ? parseFormDate(endDateRaw) : null;
  if (endDateRaw && !endDate) issues.push(`End Date "${endDateRaw}" is unparseable`);

  const start = parseFormTime(g('Doors open / Start time'));
  if (!start) issues.push(`Start time "${g('Doors open / Start time')}" is missing or unparseable`);
  const end = parseFormTime(g('End time'));
  if (!end) issues.push(`End time "${g('End time')}" is missing or unparseable`);

  const organizer = g('Organizer Name');
  if (!organizer) issues.push('missing Organizer Name');
  const url = g('Event Page / Ticket URL');
  if (!url) issues.push('missing Event Page / Ticket URL');

  const { venueId, proposal } = resolveVenue(
    g('Venue'), g('If other - venue name'), g('If other - address'), g('If other - neighborhood'), venues,
  );
  if (!venueId) {
    issues.push(
      proposal
        ? `new venue "${proposal.name}" needs a venues.csv row before this event can be added`
        : `Venue "${g('Venue')}" doesn't match any known venue`,
    );
  }

  if (issues.length) return { issues, venueProposal: proposal };

  const band = g('Band Name');
  const dj = g('DJ Name');
  const style = mapStyle(g('Dance Style'), notes);
  const music = mapMusic(g('Music'), { band, dj }, notes);
  const beginnerClass = mapBeginnerClass(g('Beginner Class?'), g('Beginner class start time'), notes);

  const row = {
    id: `${slugify(name)}-${date}`,
    name,
    style,
    venue_id: venueId,
    date,
    end_date: endDate ?? '',
    start,
    end,
    price: g('Price'),
    payment: g('Accepted Payment Methods'),
    beginner_class: beginnerClass,
    music,
    dj,
    band,
    organizer,
    url,
    description: g('Event description'),
    status: 'draft',
  };

  return { row, notes, issues: [] };
}

function readCsv(text) {
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return { fields: parsed.meta.fields ?? [], rows: parsed.data };
}

function readDataset(file) {
  const p = path.join(DATA_DIR, `${file}.csv`);
  if (!existsSync(p)) return { fields: [], rows: [] };
  return readCsv(readFileSync(p, 'utf-8'));
}

async function fetchResponses(csvUrl) {
  const res = await fetch(csvUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`form responses fetch: HTTP ${res.status}`);
  return readCsv(await res.text());
}

async function main() {
  const csvUrl = process.env.FORM_RESPONSES_CSV_URL;
  if (!csvUrl) {
    console.error('FORM_RESPONSES_CSV_URL is not set — see docs/architecture/FORM_SYNC.md');
    process.exit(1);
  }

  const venues = readDataset('venues');
  const series = readDataset('series');
  const exceptions = readDataset('exceptions');
  const oneoffs = readDataset('oneoffs');
  const bands = readDataset('bands');
  const existingIds = new Set(oneoffs.rows.map((r) => (r.id ?? '').trim()).filter(Boolean));

  const responses = await fetchResponses(csvUrl);

  const added = [];
  const corrections = [];
  const incomplete = [];
  const venueProposals = new Map(); // name -> proposal, deduped
  let skipped = 0;

  for (const response of responses.rows) {
    const { row, correction, notes, issues, venueProposal } = mapResponse(response, venues);
    if (correction) { corrections.push(correction); continue; }
    if (issues.length) {
      incomplete.push({ name: response['Event Name'] || '(no name)', timestamp: response['Timestamp'] || '', issues });
      if (venueProposal) venueProposals.set(venueProposal.name, venueProposal);
      continue;
    }
    if (existingIds.has(row.id)) { skipped += 1; continue; }
    added.push({ row, notes: notes ?? [] });
  }

  // --- surgical text write: append-only, same discipline as scrape.mjs ---
  const oneoffsLines = readFileSync(ONEOFFS_PATH, 'utf-8').replace(/\n+$/, '').split('\n');
  for (const { row } of added) oneoffsLines.push(formatRow(row));
  const oneoffsText = `${oneoffsLines.join('\n')}\n`;

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());

  const baseErrors = new Set(validateData({ venues, series, exceptions, oneoffs, bands }, { today }).errors);
  const reOneoffs = Papa.parse(oneoffsText, { header: true, skipEmptyLines: true });
  const afterErrors = validateData({
    venues, series, exceptions,
    oneoffs: { fields: reOneoffs.meta.fields ?? [], rows: reOneoffs.data },
    bands,
  }, { today }).errors;
  const newErrors = afterErrors.filter((e) => !baseErrors.has(e));

  const report = buildReport({ added, corrections, incomplete, venueProposals: [...venueProposals.values()], skipped, errors: newErrors });
  writeFileSync(REPORT_PATH, report);
  process.stdout.write(report);

  if (newErrors.length) {
    console.error(`\n✖ form-sync introduced ${newErrors.length} schema error(s) — not writing.`);
    process.exit(1);
  }

  if (added.length === 0) {
    console.log('\nNo new submissions.');
    return;
  }
  if (DRY_RUN) {
    console.log(`\n[dry-run] ${added.length} new draft event(s) — nothing written.`);
    return;
  }
  writeFileSync(ONEOFFS_PATH, oneoffsText);
  console.log(`\nWrote ${added.length} new draft event(s) to data/oneoffs.csv`);
}

function buildReport({ added, corrections, incomplete, venueProposals, skipped, errors }) {
  const lines = ['## Form submissions — review', ''];

  lines.push(`### New draft events (${added.length})`);
  for (const { row, notes } of added) {
    lines.push(`- \`${row.id}\`  ${row.name} @ ${row.venue_id}  ${row.date} ${row.start}–${row.end}`);
    for (const n of notes) lines.push(`  - ⚠ ${n}`);
  }
  lines.push('');

  lines.push(`### Corrections reported (${corrections.length}) — apply by hand, not auto-merged`);
  for (const c of corrections) {
    lines.push(`- **${c.name}** (${c.organizer}) says this corrects: "${c.reference}" — submitted ${c.timestamp}`);
  }
  lines.push('');

  lines.push(`### Incomplete / unresolved submissions (${incomplete.length})`);
  for (const i of incomplete) {
    lines.push(`- **${i.name}** (${i.timestamp})`);
    for (const issue of i.issues) lines.push(`  - ${issue}`);
  }
  lines.push('');

  if (venueProposals.length) {
    lines.push(`### New venues proposed (${venueProposals.length}) — needs a venues.csv row first`);
    for (const p of venueProposals) lines.push(`- **${p.name}** — ${p.address || '(no address)'}, ${p.neighborhood || '(no neighborhood)'}`);
    lines.push('');
  }

  lines.push(`_Skipped ${skipped} submission(s) already on the calendar._`);

  if (errors.length) {
    lines.push('', '### ❌ Schema errors introduced by this sync (not written)');
    lines.push(...errors.map((e) => `- ${e}`));
  }
  lines.push('', '🤖 Generated by `scripts/form-sync.mjs`');
  return `${lines.join('\n')}\n`;
}

// Run as CLI only (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
