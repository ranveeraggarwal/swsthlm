// Schema + integrity validation for the /data CSVs. The CI gate (issue #3).
// Errors fail the build; warnings are printed but don't. Run:
//   node scripts/validate-data.mjs              (schema + integrity)
//   node scripts/validate-data.mjs --check-urls (also HEAD-check URLs)
//
// The rules mirror docs/DATA.md §"Validation rules". This file is the
// authority CI enforces, so the enum sets live here rather than importing the
// TS types (keeps it runnable in CI with no build step).

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';

const DATA_DIR = path.join(process.cwd(), 'data');

const STYLES = new Set(['lindy-hop', 'balboa', 'blues', 'shag', 'all']);
const MUSIC = new Set(['live', 'dj', 'mixed']);
const WEEKDAYS = new Set([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);
const SERIES_STATUS = new Set(['draft', 'live', 'ended']);
const ONEOFF_STATUS = new Set(['draft', 'live', 'ended', 'cancelled']);
// Band-roster trust flag: yes = trusted swing band, no = known not-swing
// (suppressed), unknown = surfaced and awaiting a human decision.
const SWING = new Set(['yes', 'no', 'unknown']);

// required = must be present AND non-empty; optional = may be absent/empty.
const SCHEMA = {
  venues: {
    required: ['id', 'name', 'address', 'neighborhood'],
    optional: ['lat', 'lng', 'maps_url'],
  },
  series: {
    required: [
      'id', 'name', 'style', 'venue_id', 'weekday', 'start', 'end', 'price',
      'music', 'organizer', 'url', 'status', 'valid_from',
    ],
    optional: ['payment', 'beginner_class', 'dj', 'band', 'description', 'valid_to'],
  },
  exceptions: {
    required: ['series_id', 'date'],
    optional: ['cancelled', 'start', 'end', 'dj', 'band', 'music', 'price', 'note', 'description'],
  },
  oneoffs: {
    required: [
      'id', 'name', 'style', 'venue_id', 'date', 'start', 'end', 'music',
      'organizer', 'url', 'status',
    ],
    optional: ['end_date', 'price', 'payment', 'beginner_class', 'dj', 'band', 'description'],
  },
  bands: {
    required: ['id', 'name', 'style', 'swing'],
    optional: ['aliases', 'notes'],
  },
};

// Contract marks these required, but docs/DATA.md treats an empty value as
// "unknown — get it filled in." So emptiness is a warning, not a hard fail.
const SOFT_EMPTY = {
  series: new Set(['price']),
  venues: new Set(['neighborhood']),
};

const WEEKDAY_BY_INDEX = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

const isDateShape = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
function isRealDate(s) {
  if (!isDateShape(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const weekdayOf = (s) => WEEKDAY_BY_INDEX[new Date(`${s}T00:00:00Z`).getUTCDay()];
const val = (row, col) => (row[col] ?? '').trim();

/**
 * Validate the four datasets. Each dataset is { fields: string[], rows: object[] }.
 * Returns { errors: string[], warnings: string[] } — readable, location-tagged.
 */
export function validateData(datasets, opts = {}) {
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  const errors = [];
  const warnings = [];
  const err = (file, row, msg) => errors.push(`${file}.csv${row ? `:row ${row}` : ''} — ${msg}`);
  const warn = (file, row, msg) => warnings.push(`${file}.csv${row ? `:row ${row}` : ''} — ${msg}`);

  // Header columns: required present, none unknown. (row index: header is row
  // 1, so data row i is spreadsheet row i + 1.)
  for (const [file, { required, optional }] of Object.entries(SCHEMA)) {
    const ds = datasets[file];
    if (!ds) {
      err(file, 0, 'file missing or unreadable');
      continue;
    }
    const allowed = new Set([...required, ...optional]);
    const fields = ds.fields ?? [];
    for (const col of required) {
      if (!fields.includes(col)) err(file, 0, `missing required column "${col}"`);
    }
    for (const col of fields) {
      if (!allowed.has(col)) err(file, 0, `unknown column "${col}"`);
    }
  }

  const venueIds = new Set((datasets.venues?.rows ?? []).map((r) => val(r, 'id')).filter(Boolean));
  const seriesById = new Map(
    (datasets.series?.rows ?? []).map((r) => [val(r, 'id'), r]).filter(([id]) => id)
  );

  const checkRequiredNonEmpty = (file, row, n) => {
    for (const col of SCHEMA[file].required) {
      if (val(row, col) === '') {
        if (SOFT_EMPTY[file]?.has(col)) warn(file, n, `"${col}" is empty (unknown — get it filled in)`);
        else err(file, n, `required field "${col}" is empty`);
      }
    }
  };
  const checkDescription = (file, n, row) => {
    const d = val(row, 'description');
    if (d && /\b\d{1,2}\/\d{1,2}\b/.test(d)) {
      warn(file, n, 'description contains a date-like "DD/MM" — structured date should be the source of truth');
    }
  };
  const checkTba = (file, n, row) => {
    for (const col of ['dj', 'band']) {
      if (/\btba\b/i.test(val(row, col))) warn(file, n, `"${col}" is TBA`);
    }
  };

  // --- venues ---
  const seenVenue = new Set();
  (datasets.venues?.rows ?? []).forEach((row, i) => {
    const n = i + 2;
    checkRequiredNonEmpty('venues', row, n);
    const id = val(row, 'id');
    if (id && seenVenue.has(id)) err('venues', n, `duplicate id "${id}"`);
    seenVenue.add(id);
  });

  // --- series ---
  const seenSeries = new Set();
  (datasets.series?.rows ?? []).forEach((row, i) => {
    const n = i + 2;
    checkRequiredNonEmpty('series', row, n);
    const id = val(row, 'id');
    if (id && seenSeries.has(id)) err('series', n, `duplicate id "${id}"`);
    seenSeries.add(id);

    const style = val(row, 'style');
    if (style && !STYLES.has(style)) err('series', n, `invalid style "${style}"`);
    const music = val(row, 'music');
    if (music && !MUSIC.has(music)) err('series', n, `invalid music "${music}"`);
    const status = val(row, 'status');
    if (status && !SERIES_STATUS.has(status)) err('series', n, `invalid status "${status}"`);
    const weekday = val(row, 'weekday');
    if (weekday && !WEEKDAYS.has(weekday)) err('series', n, `invalid weekday "${weekday}"`);

    for (const col of ['start', 'end']) {
      const t = val(row, col);
      if (t && !isTime(t)) err('series', n, `"${col}" is not HH:MM ("${t}")`);
    }
    const bc = val(row, 'beginner_class');
    if (bc && bc !== 'yes' && !isTime(bc)) err('series', n, `beginner_class must be "yes" or HH:MM ("${bc}")`);

    const vf = val(row, 'valid_from');
    if (vf && !isRealDate(vf)) err('series', n, `valid_from is not a real date ("${vf}")`);
    const vt = val(row, 'valid_to');
    if (vt && !isRealDate(vt)) err('series', n, `valid_to is not a real date ("${vt}")`);
    if (vf && vt && isRealDate(vf) && isRealDate(vt) && vt < vf) err('series', n, 'valid_to is before valid_from');

    const venueId = val(row, 'venue_id');
    if (venueId && !venueIds.has(venueId)) err('series', n, `venue_id "${venueId}" not found in venues.csv`);

    // valid_to within 4 weeks → warn the series is winding down.
    if (vt && isRealDate(vt) && vt >= today && vt <= addDays(today, 28)) {
      warn('series', n, `valid_to ${vt} is within 4 weeks — series ending soon`);
    }
    checkDescription('series', n, row);
    checkTba('series', n, row);
  });

  // --- exceptions ---
  (datasets.exceptions?.rows ?? []).forEach((row, i) => {
    const n = i + 2;
    checkRequiredNonEmpty('exceptions', row, n);
    const sid = val(row, 'series_id');
    const series = seriesById.get(sid);
    if (sid && !series) err('exceptions', n, `series_id "${sid}" not found in series.csv`);

    const date = val(row, 'date');
    if (date && !isRealDate(date)) {
      err('exceptions', n, `date is not a real date ("${date}")`);
    } else if (date && series) {
      const w = weekdayOf(date);
      const sw = val(series, 'weekday');
      if (sw && w !== sw) err('exceptions', n, `date ${date} is a ${w}, but series "${sid}" runs on ${sw}`);
    }

    const cancelled = val(row, 'cancelled');
    if (cancelled && cancelled !== 'yes') err('exceptions', n, `cancelled must be "yes" or empty ("${cancelled}")`);
    const music = val(row, 'music');
    if (music && !MUSIC.has(music)) err('exceptions', n, `invalid music "${music}"`);
    for (const col of ['start', 'end']) {
      const t = val(row, col);
      if (t && !isTime(t)) err('exceptions', n, `"${col}" is not HH:MM ("${t}")`);
    }
    checkDescription('exceptions', n, row);
    checkTba('exceptions', n, row);
  });

  // --- oneoffs ---
  const seenOneoff = new Set();
  (datasets.oneoffs?.rows ?? []).forEach((row, i) => {
    const n = i + 2;
    checkRequiredNonEmpty('oneoffs', row, n);
    const id = val(row, 'id');
    if (id && seenOneoff.has(id)) err('oneoffs', n, `duplicate id "${id}"`);
    seenOneoff.add(id);

    const style = val(row, 'style');
    if (style && !STYLES.has(style)) err('oneoffs', n, `invalid style "${style}"`);
    const music = val(row, 'music');
    if (music && !MUSIC.has(music)) err('oneoffs', n, `invalid music "${music}"`);
    const status = val(row, 'status');
    if (status && !ONEOFF_STATUS.has(status)) err('oneoffs', n, `invalid status "${status}"`);

    for (const col of ['start', 'end']) {
      const t = val(row, col);
      if (t && !isTime(t)) err('oneoffs', n, `"${col}" is not HH:MM ("${t}")`);
    }
    const bc = val(row, 'beginner_class');
    if (bc && bc !== 'yes' && !isTime(bc)) err('oneoffs', n, `beginner_class must be "yes" or HH:MM ("${bc}")`);

    const date = val(row, 'date');
    if (date && !isRealDate(date)) err('oneoffs', n, `date is not a real date ("${date}")`);
    const endDate = val(row, 'end_date');
    if (endDate && !isRealDate(endDate)) err('oneoffs', n, `end_date is not a real date ("${endDate}")`);
    if (date && endDate && isRealDate(date) && isRealDate(endDate) && endDate < date) {
      err('oneoffs', n, 'end_date is before date');
    }

    const venueId = val(row, 'venue_id');
    if (venueId && !venueIds.has(venueId)) err('oneoffs', n, `venue_id "${venueId}" not found in venues.csv`);

    // A live one-off entirely in the past should be marked `ended` (kept for
    // the archive) rather than left `live`.
    const last = endDate && isRealDate(endDate) ? endDate : date;
    if (status === 'live' && last && isRealDate(last) && last < today) {
      err('oneoffs', n, `live one-off is entirely in the past (last day ${last} < ${today}) — mark it status=ended`);
    }
    // TBA within 7 days for a live-music night.
    if (status === 'live' && val(row, 'music') === 'live' && date && isRealDate(date) && date >= today && date <= addDays(today, 7) && !val(row, 'band')) {
      warn('oneoffs', n, `live-music night within 7 days (${date}) has no band yet`);
    }
    checkDescription('oneoffs', n, row);
    checkTba('oneoffs', n, row);
  });

  // --- bands (trusted-roster registry; read by the scraper) ---
  const seenBand = new Set();
  (datasets.bands?.rows ?? []).forEach((row, i) => {
    const n = i + 2;
    checkRequiredNonEmpty('bands', row, n);
    const id = val(row, 'id');
    if (id && seenBand.has(id)) err('bands', n, `duplicate id "${id}"`);
    seenBand.add(id);

    const style = val(row, 'style');
    if (style && !STYLES.has(style)) err('bands', n, `invalid style "${style}"`);
    const swing = val(row, 'swing');
    if (swing && !SWING.has(swing)) err('bands', n, `invalid swing "${swing}" (yes|no|unknown)`);
  });

  return { errors, warnings };
}

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Collect every URL field for the optional HEAD check.
export function collectUrls(datasets) {
  const urls = [];
  for (const file of ['series', 'oneoffs']) {
    (datasets[file]?.rows ?? []).forEach((row, i) => {
      const u = val(row, 'url');
      if (u) urls.push({ file, row: i + 2, url: u });
    });
  }
  for (const row of datasets.venues?.rows ?? []) {
    const u = val(row, 'maps_url');
    if (u) urls.push({ file: 'venues', url: u });
  }
  return urls;
}

async function checkUrls(datasets) {
  const warnings = [];
  const targets = collectUrls(datasets);
  await Promise.allSettled(
    targets.map(async ({ file, row, url }) => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) warnings.push(`${file}.csv${row ? `:row ${row}` : ''} — URL returned ${res.status}: ${url}`);
      } catch {
        warnings.push(`${file}.csv${row ? `:row ${row}` : ''} — URL unreachable: ${url}`);
      }
    })
  );
  return warnings;
}

function readDataset(file) {
  const p = path.join(DATA_DIR, `${file}.csv`);
  if (!existsSync(p)) return null;
  const parsed = Papa.parse(readFileSync(p, 'utf-8'), { header: true, skipEmptyLines: true });
  return { fields: parsed.meta.fields ?? [], rows: parsed.data };
}

async function main() {
  const datasets = {
    venues: readDataset('venues'),
    series: readDataset('series'),
    exceptions: readDataset('exceptions'),
    oneoffs: readDataset('oneoffs'),
    bands: readDataset('bands'),
  };

  const { errors, warnings } = validateData(datasets);

  if (process.argv.includes('--check-urls')) {
    console.log('Checking URLs (HEAD, non-blocking)…');
    warnings.push(...(await checkUrls(datasets)));
  }

  for (const w of warnings) console.warn(`⚠️  ${w}`);
  for (const e of errors) console.error(`❌ ${e}`);

  if (errors.length > 0) {
    console.error(`\n✖ ${errors.length} error(s), ${warnings.length} warning(s). Data is invalid.`);
    process.exit(1);
  }
  console.log(`\n✓ Data valid. ${warnings.length} warning(s).`);
}

// Run as CLI only (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
