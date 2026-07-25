// Reading `/data/*.csv` into typed rows. **Server-only.**
//
// `node:fs` and PapaParse are imported here and nowhere else, so this module can
// never end up in a client bundle: importing it from a `'use client'` component
// fails the build. That is the boundary — there is no lint rule guarding it, so
// keep the I/O in this file.
//
// The coercion is deliberately forgiving. A CSV cell is always a string, and a
// human editing a spreadsheet leaves stray whitespace and empty columns; a
// missing optional value should read as `undefined`, not `''`. What is *not*
// forgiving is the schema — `scripts/validate-data.mjs` gates every pull request
// against docs/DATA.md, so the enum casts below are safe by the time data lands
// on main.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import type {
  Exception,
  FloorType,
  Music,
  Oneoff,
  OneoffStatus,
  Series,
  SeriesStatus,
  Style,
  Venue,
  Weekday,
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

type Row = Record<string, string>;

function readCsv(file: string): Row[] {
  const csv = readFileSync(path.join(DATA_DIR, file), 'utf-8');
  return Papa.parse<Row>(csv, { header: true, skipEmptyLines: true }).data;
}

/** A required cell: trimmed. */
const req = (v?: string) => (v ?? '').trim();

/** An optional cell: trimmed, or `undefined` when blank. */
const opt = (v?: string) => {
  const trimmed = req(v);
  return trimmed === '' ? undefined : trimmed;
};

const isYes = (v?: string) => req(v).toLowerCase() === 'yes';

export function loadVenues(): Map<string, Venue> {
  const venues = new Map<string, Venue>();
  for (const r of readCsv('venues.csv')) {
    if (!req(r.id)) continue;
    venues.set(req(r.id), {
      id: req(r.id),
      name: req(r.name),
      address: req(r.address),
      neighborhood: req(r.neighborhood),
      lat: opt(r.lat),
      lng: opt(r.lng),
      mapsUrl: opt(r.maps_url),
      floorType: opt(r.floor_type) as FloorType | undefined,
    });
  }
  return venues;
}

export function loadSeries(): Series[] {
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

export function loadExceptions(): Exception[] {
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

export function loadOneoffs(): Oneoff[] {
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
