// Build-time expansion: series + exceptions -> concrete dated occurrences,
// merged with oneoffs. Pure functions, no I/O — fed typed rows, returns
// Occurrence[]. CSV loading is wired in #7.
//
// DST safety: all date stepping is calendar arithmetic at UTC midnight
// (setUTCDate), never epoch/local-time math. A weekly series therefore can
// never drift onto the wrong weekday across the Europe/Stockholm DST switches.
// Wall-clock start/end are opaque strings, carried through untouched.

import type {
  Exception,
  ExpandOptions,
  Occurrence,
  Oneoff,
  Series,
  Weekday,
} from './types';

// Indexed by Date.getUTCDay(): 0 = Sunday … 6 = Saturday.
const WEEKDAY_BY_INDEX: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const DEFAULT_WEEKS = 10;

function parseUTC(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function addDays(iso: string, days: number): string {
  const d = parseUTC(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(iso: string): Weekday {
  return WEEKDAY_BY_INDEX[parseUTC(iso).getUTCDay()];
}

// YYYY-MM-DD sorts and compares correctly as plain strings.
const minISO = (a: string, b: string) => (a < b ? a : b);
const maxISO = (a: string, b: string) => (a > b ? a : b);

function applyException(occ: Occurrence, exceptions: Exception[]): Occurrence {
  const exc = exceptions.find(
    (e) => e.seriesId === occ.sourceId && e.date === occ.date
  );
  if (!exc) return occ;
  // A cancellation wins outright; per the contract all other overrides are
  // ignored so the card still shows the original details, struck through.
  if (exc.cancelled) return { ...occ, cancelled: true };
  return {
    ...occ,
    start: exc.start ?? occ.start,
    end: exc.end ?? occ.end,
    dj: exc.dj ?? occ.dj,
    band: exc.band ?? occ.band,
    music: exc.music ?? occ.music,
    price: exc.price ?? occ.price,
    note: exc.note ?? occ.note,
    description: exc.description ?? occ.description,
  };
}

export function expandSeries(
  series: Series,
  exceptions: Exception[],
  opts: ExpandOptions
): Occurrence[] {
  const weeks = opts.weeks ?? DEFAULT_WEEKS;
  const includeDrafts = opts.includeDrafts ?? false;

  if (series.status === 'ended') return [];
  if (series.status === 'draft' && !includeDrafts) return [];

  const windowEnd = addDays(opts.today, weeks * 7);
  const lookbackStart = opts.lookbackDays ? addDays(opts.today, -opts.lookbackDays) : opts.today;
  const startBound = maxISO(series.validFrom, lookbackStart);
  const endBound = minISO(series.validTo ?? windowEnd, windowEnd);
  if (startBound > endBound) return [];

  // Walk forward to the first matching weekday on/after the lower bound.
  let cursor = startBound;
  for (let i = 0; i < 7 && weekdayOf(cursor) !== series.weekday; i += 1) {
    cursor = addDays(cursor, 1);
  }

  const occurrences: Occurrence[] = [];
  while (cursor <= endBound) {
    occurrences.push(
      applyException(
        {
          occurrenceId: `${series.id}:${cursor}`,
          sourceId: series.id,
          sourceType: 'series',
          date: cursor,
          name: series.name,
          style: series.style,
          venueId: series.venueId,
          start: series.start,
          end: series.end,
          price: series.price,
          payment: series.payment,
          beginnerClass: series.beginnerClass,
          music: series.music,
          dj: series.dj,
          band: series.band,
          organizer: series.organizer,
          url: series.url,
          description: series.description,
          cancelled: false,
        },
        exceptions
      )
    );
    cursor = addDays(cursor, 7);
  }
  return occurrences;
}

export function expandOneoff(
  oneoff: Oneoff,
  opts: ExpandOptions
): Occurrence[] {
  const includeDrafts = opts.includeDrafts ?? false;
  // `ended` is terminal — kept for the archive, never on the live calendar.
  if (oneoff.status === 'ended') return [];
  if (oneoff.status === 'draft' && !includeDrafts) return [];

  const cancelled = oneoff.status === 'cancelled';
  const last = oneoff.endDate ?? oneoff.date;
  const lookbackStart = opts.lookbackDays ? addDays(opts.today, -opts.lookbackDays) : opts.today;

  const occurrences: Occurrence[] = [];
  let cursor = oneoff.date;
  while (cursor <= last) {
    // Drop days before the lookback window; keep today and forward (no upper
    // window — a one-off further out than the series horizon should still show).
    if (cursor >= lookbackStart) {
      occurrences.push({
        occurrenceId: `${oneoff.id}:${cursor}`,
        sourceId: oneoff.id,
        sourceType: 'oneoff',
        date: cursor,
        name: oneoff.name,
        style: oneoff.style,
        venueId: oneoff.venueId,
        start: oneoff.start,
        end: oneoff.end,
        price: oneoff.price,
        payment: oneoff.payment,
        beginnerClass: oneoff.beginnerClass,
        music: oneoff.music,
        dj: oneoff.dj,
        band: oneoff.band,
        organizer: oneoff.organizer,
        url: oneoff.url,
        description: oneoff.description,
        cancelled,
      });
    }
    cursor = addDays(cursor, 1);
  }
  return occurrences;
}

// Full pipeline: expand everything, merge, sort chronologically by date then
// start time. This is what the site, ICS feed, and JSON-LD consume.
export function expandAll(
  series: Series[],
  exceptions: Exception[],
  oneoffs: Oneoff[],
  opts: ExpandOptions
): Occurrence[] {
  const all = [
    ...series.flatMap((s) => expandSeries(s, exceptions, opts)),
    ...oneoffs.flatMap((o) => expandOneoff(o, opts)),
  ];
  return all.sort((a, b) =>
    a.date === b.date ? a.start.localeCompare(b.start) : a.date.localeCompare(b.date)
  );
}
