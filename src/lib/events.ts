// Server-only data loading. Reads the four CSVs under /data at build time,
// coerces them to typed rows, expands series + exceptions into occurrences
// (merged with one-offs), joins venue details, and adapts to the SwingEvent
// shape the UI renders. PapaParse + fs are used here only — never shipped to
// the client (the `node:fs` import below makes any client import fail loudly).

import { readFileSync } from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import { SwingEvent } from '@/types/event';
import { getStockholmCurrentDate } from '@/lib/datetime';
import { expandAll } from '@/lib/data/expand';
import type {
  Exception,
  Music,
  Oneoff,
  OneoffStatus,
  Series,
  SeriesStatus,
  Style,
  Venue,
  Weekday,
} from '@/lib/data/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const EXPANSION_WEEKS = 10;

type Row = Record<string, string>;

function readCsv(file: string): Row[] {
  const csv = readFileSync(path.join(DATA_DIR, file), 'utf-8');
  const parsed = Papa.parse<Row>(csv, { header: true, skipEmptyLines: true });
  return parsed.data;
}

// Optional cell → trimmed value or undefined. Required cell → trimmed value.
const opt = (v?: string) => {
  const t = (v ?? '').trim();
  return t === '' ? undefined : t;
};

// TBA, t.b.a, or empty (trimmed, case-insensitive) → undefined.
const filterTba = (v?: string) => {
  const t = (v ?? '').trim();
  const low = t.toLowerCase();
  if (low === '' || low === 'tba' || low === 't.b.a') return undefined;
  return t;
};
const req = (v?: string) => (v ?? '').trim();
const isYes = (v?: string) => (v ?? '').trim().toLowerCase() === 'yes';

function loadVenues(): Map<string, Venue> {
  const map = new Map<string, Venue>();
  for (const r of readCsv('venues.csv')) {
    if (!req(r.id)) continue;
    map.set(req(r.id), {
      id: req(r.id),
      name: req(r.name),
      address: req(r.address),
      neighborhood: req(r.neighborhood),
      lat: opt(r.lat),
      lng: opt(r.lng),
      mapsUrl: opt(r.maps_url),
    });
  }
  return map;
}

function loadSeries(): Series[] {
  return readCsv('series.csv')
    .filter((r) => req(r.id))
    .map((r) => ({
      id: req(r.id),
      name: req(r.name),
      style: req(r.style) as Style,
      venueId: req(r.venue_id),
      weekday: req(r.weekday) as Weekday,
      start: req(r.start),
      end: req(r.end),
      price: req(r.price),
      payment: opt(r.payment),
      beginnerClass: opt(r.beginner_class),
      music: req(r.music) as Music,
      dj: opt(r.dj),
      band: opt(r.band),
      organizer: req(r.organizer),
      url: req(r.url),
      description: opt(r.description),
      status: req(r.status) as SeriesStatus,
      validFrom: req(r.valid_from),
      validTo: opt(r.valid_to),
    }));
}

function loadExceptions(): Exception[] {
  return readCsv('exceptions.csv')
    .filter((r) => req(r.series_id))
    .map((r) => ({
      seriesId: req(r.series_id),
      date: req(r.date),
      cancelled: isYes(r.cancelled),
      start: opt(r.start),
      end: opt(r.end),
      dj: opt(r.dj),
      band: opt(r.band),
      music: opt(r.music) as Music | undefined,
      price: opt(r.price),
      note: opt(r.note),
      description: opt(r.description),
    }));
}

function loadOneoffs(): Oneoff[] {
  return readCsv('oneoffs.csv')
    .filter((r) => req(r.id))
    .map((r) => ({
      id: req(r.id),
      name: req(r.name),
      style: req(r.style) as Style,
      venueId: req(r.venue_id),
      date: req(r.date),
      endDate: opt(r.end_date),
      start: req(r.start),
      end: req(r.end),
      price: opt(r.price),
      payment: opt(r.payment),
      beginnerClass: opt(r.beginner_class),
      music: req(r.music) as Music,
      dj: opt(r.dj),
      band: opt(r.band),
      organizer: req(r.organizer),
      url: req(r.url),
      description: opt(r.description),
      status: req(r.status) as OneoffStatus,
    }));
}

// The UI's style label/colour logic keys off 'lindy' (legacy); keep that
// mapping until the style-tag work (#20) reworks the labels.
function styleForUi(style: Style): string {
  return style === 'lindy-hop' ? 'lindy' : style;
}

/**
 * Build-time event feed: expand /data into concrete occurrences and adapt them
 * to SwingEvent for the renderer. Past occurrences are already dropped by the
 * expansion (relative to the build date); the site rebuilds on push to main.
 */
export async function getEvents(): Promise<SwingEvent[]> {
  const venues = loadVenues();
  const occurrences = expandAll(loadSeries(), loadExceptions(), loadOneoffs(), {
    today: getStockholmCurrentDate(),
    weeks: EXPANSION_WEEKS,
  });

  return occurrences.map((occ) => {
    const venue = venues.get(occ.venueId);
    return {
      id: occ.occurrenceId,
      title: occ.name,
      status: 'published',
      date: occ.date,
      start: occ.start,
      end: occ.end,
      venue: venue?.name ?? occ.venueId,
      address: venue?.address ?? '',
      neighborhood: venue?.neighborhood,
      style: styleForUi(occ.style),
      music: occ.music,
      organizer: occ.organizer,
      band: filterTba(occ.band),
      dj: filterTba(occ.dj),
      price: occ.price,
      payment: occ.payment,
      ticket: occ.url,
      body: occ.description ?? '',
      beginnerClass: occ.beginnerClass,
    };
  });
}
