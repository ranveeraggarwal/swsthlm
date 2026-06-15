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
import { isSwingRelevant, looksLikeNoise } from './scrapers/lib/genre.mjs';
import { loadBands, classify, normalizeBand, slugifyBand } from './scrapers/lib/bands.mjs';
import { ONEOFF_FIELDS, candidateToRow, formatRow } from './scrapers/lib/candidate.mjs';
import * as staclara from './scrapers/sources/staclara.mjs';
import * as chicago from './scrapers/sources/chicago.mjs';

const SOURCES = [staclara, chicago];

const DATA_DIR = path.join(process.cwd(), 'data');
const ONEOFFS_PATH = path.join(DATA_DIR, 'oneoffs.csv');
const BANDS_PATH = path.join(DATA_DIR, 'bands.csv');
const REPORT_PATH = path.join(process.cwd(), 'scrape-report.md');
const NEWBANDS_REPORT_PATH = path.join(process.cwd(), 'new-bands-report.md');
const BAND_FIELDS = ['id', 'name', 'aliases', 'style', 'swing', 'notes'];
const DRY_RUN = process.argv.includes('--dry-run');

const formatCsvRow = (row, cols) => Papa.unparse([row], { header: false, columns: cols });

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
  const bands = readDataset('bands');

  const today = stockholmToday();
  const coverage = buildCoverage(oneoffs, series);
  const existingById = new Map(oneoffs.rows.map((r) => [val(r, 'id'), r]));
  const roster = loadBands(BANDS_PATH);
  const existingBandIds = new Set(bands.rows.map((r) => val(r, 'id')).filter(Boolean));

  // Gather candidates from every source; a thrown/empty source is a warning,
  // not a crash (feeds the dead-source signal).
  const candidates = [];
  const sourceNotes = [];
  const newActs = new Map(); // normalized band name -> { name, venueId, date, genre }
  let pastFiltered = 0;

  for (const src of SOURCES) {
    try {
      const got = await src.scrape();
      if (got.length === 0) {
        sourceNotes.push(`⚠️ ${src.label}: returned 0 events — check the source`);
      }
      // Drop past candidates up front — neither events nor new-act discovery
      // should surface anything already over.
      const future = got.filter((c) => c.date >= today);
      pastFiltered += got.length - future.length;

      // Relevance is declared per source, not global:
      //   'all'    swing-dedicated venue — every event is a dance night.
      //   'roster' mixed venue — cut non-music noise, then trust by band: a
      //            trusted band yields an event; rejected/pending drop; an
      //            unknown band is surfaced for vetting (never an event).
      //   'genre'  mixed venue, keyword-only (legacy) — kept for flexibility.
      // Undeclared defaults to 'genre' (safer to drop than to flood).
      let kept;
      if (src.relevance === 'all') {
        kept = future;
        sourceNotes.push(`${src.label}: ${kept.length} event(s) [trusted venue]`);
      } else if (src.relevance === 'roster') {
        kept = [];
        let newCount = 0;
        let dropped = 0;
        for (const c of future) {
          const res = classify(c.band || c.name, roster);
          if (res.status === 'trusted') {
            kept.push(c); // trust the band regardless of how the night is billed
            continue;
          }
          if (res.status !== 'new') { dropped += 1; continue; } // rejected or pending
          // Unknown act: only worth surfacing if it isn't non-music noise
          // (quiz/jam/rock/folk). The noise cut applies to discovery only.
          if (looksLikeNoise(`${c.name} ${c.description ?? ''}`)) { dropped += 1; continue; }
          newCount += 1;
          const key = normalizeBand(c.band || c.name);
          if (key && !newActs.has(key)) {
            newActs.set(key, { name: c.band || c.name, venueId: c.venueId, date: c.date, genre: c.description ?? '' });
          }
        }
        sourceNotes.push(`${src.label}: ${kept.length} trusted event(s), ${newCount} new act(s) for review, ${dropped} dropped`);
      } else {
        kept = future.filter((c) => isSwingRelevant(`${c.name} ${c.description ?? ''}`));
        sourceNotes.push(`${src.label}: ${kept.length} event(s) (${future.length - kept.length} filtered as non-dance)`);
      }
      candidates.push(...kept);
    } catch (e) {
      sourceNotes.push(`⚠️ ${src.label}: scrape failed — ${e.message}`);
    }
  }

  const added = [];
  const updated = [];
  let skipped = 0;

  for (const c of candidates) {
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

  // --- surgical text writes (events + new acts), append/replace as text ---
  const oneoffsLines = readFileSync(ONEOFFS_PATH, 'utf-8').replace(/\n+$/, '').split('\n');
  for (const { row } of updated) {
    const i = oneoffsLines.findIndex((ln) => ln.startsWith(`${row.id},`));
    if (i >= 0) oneoffsLines[i] = formatRow(row);
  }
  for (const row of added) oneoffsLines.push(formatRow(row));
  const oneoffsText = `${oneoffsLines.join('\n')}\n`;

  // New acts -> proposed bands.csv rows (swing=unknown), append-only with unique
  // slug ids. The human sets swing=yes/no when reviewing the new-bands PR.
  const newBandRows = [];
  for (const act of newActs.values()) {
    const base = slugifyBand(act.name);
    if (!base) continue;
    let id = base;
    for (let i = 2; existingBandIds.has(id) || newBandRows.some((r) => r.id === id); i += 1) {
      id = `${base}-${i}`;
    }
    newBandRows.push({
      id, name: act.name, aliases: '', style: 'all', swing: 'unknown',
      notes: `seen at ${act.venueId} ${act.date}`,
      // carried for the report only (not in BAND_FIELDS, so not written to CSV):
      genre: act.genre, venueId: act.venueId, date: act.date,
    });
  }
  const bandsLines = readFileSync(BANDS_PATH, 'utf-8').replace(/\n+$/, '').split('\n');
  for (const row of newBandRows) bandsLines.push(formatCsvRow(row, BAND_FIELDS));
  const bandsText = `${bandsLines.join('\n')}\n`;

  // --- validation gate (delta, not whole-file) ---
  // Block only on errors THIS scrape introduces. A pre-existing error — e.g. a
  // future `live` row that has aged into the past — must not silently halt all
  // intake. Row numbers are stable under append/replace, so error-string
  // comparison isolates the delta; pre-existing errors become warnings.
  const baseErrors = new Set(
    validateData({ venues, series, exceptions, oneoffs, bands }, { today }).errors
  );
  const reOneoffs = Papa.parse(oneoffsText, { header: true, skipEmptyLines: true });
  const reBands = Papa.parse(bandsText, { header: true, skipEmptyLines: true });
  const afterErrors = validateData({
    venues, series, exceptions,
    oneoffs: { fields: reOneoffs.meta.fields ?? [], rows: reOneoffs.data },
    bands: { fields: reBands.meta.fields ?? [], rows: reBands.data },
  }, { today }).errors;
  const newErrors = afterErrors.filter((e) => !baseErrors.has(e));
  const preexisting = afterErrors.filter((e) => baseErrors.has(e));

  const report = buildReport({ added, updated, skipped, pastFiltered, sourceNotes, errors: newErrors, preexisting });
  const newBandsReport = buildNewBandsReport(newBandRows);
  writeFileSync(REPORT_PATH, report);
  writeFileSync(NEWBANDS_REPORT_PATH, newBandsReport);
  process.stdout.write(report);
  process.stdout.write(newBandsReport);

  if (newErrors.length) {
    console.error(`\n✖ scrape introduced ${newErrors.length} schema error(s) — not writing.`);
    process.exit(1);
  }

  const eventChanges = added.length + updated.length;
  const bandChanges = newBandRows.length;
  if (eventChanges === 0 && bandChanges === 0) {
    console.log('\nNo new events or acts.');
    return;
  }
  if (DRY_RUN) {
    console.log(`\n[dry-run] ${eventChanges} event change(s), ${bandChanges} new act(s) — nothing written.`);
    return;
  }
  if (eventChanges) writeFileSync(ONEOFFS_PATH, oneoffsText);
  if (bandChanges) writeFileSync(BANDS_PATH, bandsText);
  console.log(`\nWrote ${added.length} new + ${updated.length} updated event(s); ${bandChanges} new act(s) to data/bands.csv`);
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

function buildNewBandsReport(rows) {
  const lines = ['## New acts — add to the roster?', ''];
  lines.push(
    'These acts play a mixed venue but aren’t in `data/bands.csv`. For each, set `swing` to `yes` (trusted — its events start appearing on the calendar) or `no` (suppressed, so it stops being re-surfaced every night), then merge. Ignore to leave it pending.',
    ''
  );
  lines.push(`### New acts (${rows.length})`);
  for (const r of rows) {
    lines.push(`- **${r.name}** @ ${r.venueId} ${r.date}${r.genre ? ` — "${r.genre}"` : ''}  → \`${r.id}\``);
  }
  lines.push('', '🤖 Generated by `scripts/scrape.mjs`');
  return `${lines.join('\n')}\n`;
}

main();
