// Nightly scrape runner. Runs each source parser, dedupes candidates against
// the existing data, and writes proposals into data/oneoffs.csv for a human to
// review as a PR. Never writes to main directly; the workflow opens the PR.
//
//   node scripts/scrape.mjs            # apply changes + write scrape-report.md
//   node scripts/scrape.mjs --dry-run  # report only, write nothing
//
// Safety, in order of importance:
//  1. Diffs stay surgical — we append new lines and replace only changed lines
//     as text, never re-serialize the whole file (which would make the nightly
//     PR diff the entire file and defeat human review).
//  2. The result is re-parsed and run through validateData before writing; any
//     schema error aborts the job with no write.
//  3. Dedup keys on (venue_id, date) against existing one-offs AND series
//     occurrences, so we never propose something already on the calendar.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import { validateData } from './validate-data.mjs';
import { isSwingRelevant } from './scrapers/lib/genre.mjs';
import { ONEOFF_FIELDS, candidateToRow, formatRow } from './scrapers/lib/candidate.mjs';
import * as staclara from './scrapers/sources/staclara.mjs';

const SOURCES = [staclara];

const DATA_DIR = path.join(process.cwd(), 'data');
const ONEOFFS_PATH = path.join(DATA_DIR, 'oneoffs.csv');
const REPORT_PATH = path.join(process.cwd(), 'scrape-report.md');
const DRY_RUN = process.argv.includes('--dry-run');

const val = (row, col) => (row[col] ?? '').trim();

// Today in Europe/Stockholm (en-CA formats as YYYY-MM-DD). Used both to drop
// past candidates and as validateData's reference date, so the filter and the
// gate agree on "past".
function stockholmToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function readDataset(file) {
  const p = path.join(DATA_DIR, `${file}.csv`);
  if (!existsSync(p)) return { fields: [], rows: [] };
  const parsed = Papa.parse(readFileSync(p, 'utf-8'), { header: true, skipEmptyLines: true });
  return { fields: parsed.meta.fields ?? [], rows: parsed.data };
}

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const WEEKDAY_BY_INDEX = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];
const weekdayOf = (iso) => WEEKDAY_BY_INDEX[new Date(`${iso}T00:00:00Z`).getUTCDay()];

// Every (venue_id|date) already on the calendar: one-off date ranges, plus
// series occurrences (a series occupies a date iff venue+weekday match and the
// date is inside [valid_from, valid_to] and it isn't ended/draft). This mirrors
// expand.ts's notion of coverage without stepping, so there's no DST exposure.
function buildCoverage(oneoffs, series) {
  const covered = new Set();
  for (const r of oneoffs.rows) {
    const v = val(r, 'venue_id');
    const start = val(r, 'date');
    const end = val(r, 'end_date') || start;
    if (!v || !start) continue;
    for (let d = start; d <= end; d = addDays(d, 1)) covered.add(`${v}|${d}`);
  }
  return {
    has(venueId, date) {
      if (covered.has(`${venueId}|${date}`)) return true;
      return series.rows.some((s) => {
        if (val(s, 'venue_id') !== venueId) return false;
        if (['ended', 'draft'].includes(val(s, 'status'))) return false;
        if (val(s, 'weekday') !== weekdayOf(date)) return false;
        if (date < val(s, 'valid_from')) return false;
        const to = val(s, 'valid_to');
        if (to && date > to) return false;
        return true;
      });
    },
  };
}

async function main() {
  const venues = readDataset('venues');
  const series = readDataset('series');
  const exceptions = readDataset('exceptions');
  const oneoffs = readDataset('oneoffs');

  const today = stockholmToday();
  const coverage = buildCoverage(oneoffs, series);
  const existingById = new Map(oneoffs.rows.map((r) => [val(r, 'id'), r]));

  // Gather candidates from every source; a thrown/empty source is a warning,
  // not a crash (feeds the dead-source signal).
  const candidates = [];
  const sourceNotes = [];
  for (const src of SOURCES) {
    try {
      const got = await src.scrape();
      if (got.length === 0) {
        sourceNotes.push(`⚠️ ${src.label}: returned 0 events — check the source`);
      }
      // Relevance is declared per source, not global. A swing-dedicated venue
      // ('all') keeps every event; a mixed venue ('genre') is filtered to
      // swing/jazz nights. Defaulting an undeclared source to 'genre' is the
      // safe choice — better to drop than to flood the calendar with non-dance.
      const filtered = src.relevance === 'all'
        ? got
        : got.filter((c) => isSwingRelevant(`${c.name} ${c.description ?? ''}`));
      const dropped = got.length - filtered.length;
      sourceNotes.push(
        `${src.label}: ${filtered.length} event(s)${dropped ? ` (${dropped} filtered as non-dance)` : ''}`
      );
      candidates.push(...filtered);
    } catch (e) {
      sourceNotes.push(`⚠️ ${src.label}: scrape failed — ${e.message}`);
    }
  }

  // Drop anything already past — never propose a past-dated `live` row (the
  // validator rejects them anyway).
  const pastFiltered = candidates.filter((c) => c.date < today).length;
  const current = candidates.filter((c) => c.date >= today);

  const added = [];
  const updated = [];
  let skipped = 0;

  for (const c of current) {
    const row = candidateToRow(c);
    const prior = existingById.get(c.id);
    if (prior) {
      // Scraper-owned row exists: apply changed fields (human reviews the diff).
      const changes = ONEOFF_FIELDS
        .filter((f) => (val(prior, f)) !== (row[f] ?? ''))
        .map((f) => `${f}: "${val(prior, f)}" → "${row[f]}"`);
      if (changes.length) updated.push({ row, changes });
      else skipped += 1;
    } else if (coverage.has(c.venueId, c.date)) {
      skipped += 1; // already on the calendar under a different id / a series
    } else {
      added.push(row);
    }
  }

  // --- surgical text write ---
  const raw = readFileSync(ONEOFFS_PATH, 'utf-8');
  const lines = raw.replace(/\n+$/, '').split('\n');
  for (const { row } of updated) {
    const i = lines.findIndex((ln) => ln.startsWith(`${row.id},`));
    if (i >= 0) lines[i] = formatRow(row);
  }
  for (const row of added) lines.push(formatRow(row));
  const newText = `${lines.join('\n')}\n`;

  // --- validation gate (delta, not whole-file) ---
  // Block only on errors THIS scrape introduces. A pre-existing error — e.g. a
  // future `live` row that has since aged into the past with no human flipping
  // it to `ended` — must not silently halt all intake. Row numbers are stable
  // under append + in-place replace, so comparing error strings isolates the
  // delta. Pre-existing errors are surfaced as warnings, not a hard stop.
  const baseErrors = new Set(
    validateData({ venues, series, exceptions, oneoffs }, { today }).errors
  );
  const reparsed = Papa.parse(newText, { header: true, skipEmptyLines: true });
  const afterErrors = validateData({
    venues, series, exceptions,
    oneoffs: { fields: reparsed.meta.fields ?? [], rows: reparsed.data },
  }, { today }).errors;
  const newErrors = afterErrors.filter((e) => !baseErrors.has(e));
  const preexisting = afterErrors.filter((e) => baseErrors.has(e));

  const report = buildReport({
    added, updated, skipped, pastFiltered, sourceNotes, errors: newErrors, preexisting,
  });
  writeFileSync(REPORT_PATH, report);
  process.stdout.write(report);

  if (newErrors.length) {
    console.error(`\n✖ scrape introduced ${newErrors.length} schema error(s) — not writing.`);
    process.exit(1);
  }

  const changed = added.length + updated.length;
  if (changed === 0) {
    console.log('\nNo new or changed events.');
    return;
  }
  if (DRY_RUN) {
    console.log(`\n[dry-run] ${changed} change(s) not written.`);
    return;
  }
  writeFileSync(ONEOFFS_PATH, newText);
  console.log(`\nWrote ${added.length} new, ${updated.length} updated to data/oneoffs.csv`);
}

function buildReport({ added, updated, skipped, pastFiltered, sourceNotes, errors, preexisting }) {
  const lines = ['## Scraped events — review', ''];
  lines.push(...sourceNotes.map((n) => `- ${n}`), '');

  lines.push(`### New events (${added.length})`);
  for (const r of added) {
    lines.push(`- \`${r.id}\`  ${r.name} @ ${r.venue_id}  ${r.date} ${r.start}–${r.end}`);
  }
  lines.push('');

  lines.push(`### Updated events (${updated.length}) ⚠ review`);
  for (const u of updated) {
    lines.push(`- \`${u.row.id}\``);
    for (const c of u.changes) lines.push(`  - ${c}`);
  }
  lines.push('', `_Skipped ${skipped} already on the calendar; ${pastFiltered} past-dated._`);

  if (errors.length) {
    lines.push('', '### ❌ Schema errors introduced by this scrape (not written)');
    lines.push(...errors.map((e) => `- ${e}`));
  }
  if (preexisting?.length) {
    lines.push('', '### ⚠️ Pre-existing data issues (not caused by this scrape)');
    lines.push(...preexisting.map((e) => `- ${e}`));
  }
  lines.push('', '🤖 Generated by `scripts/scrape.mjs`');
  return `${lines.join('\n')}\n`;
}

main();
