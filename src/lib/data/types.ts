// Typed representations of the four CSV files under /data and the expanded
// occurrence stream the site / ICS / JSON-LD consume. See docs/DATA.md for the
// authoritative schema; these mirror it. CSV parsing + coercion lives in #7.

export type Style = 'lindy-hop' | 'balboa' | 'blues' | 'shag' | 'all';
export type Music = 'live' | 'dj' | 'mixed';
export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type SeriesStatus = 'draft' | 'live' | 'ended';
// `ended` is terminal: the event happened and is retained for the archive,
// but never renders on the live calendar.
export type OneoffStatus = 'draft' | 'live' | 'ended' | 'cancelled';

export interface Venue {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  lat?: string;
  lng?: string;
  mapsUrl?: string;
}

export interface Series {
  id: string;
  name: string;
  style: Style;
  venueId: string;
  weekday: Weekday;
  start: string; // HH:MM, Europe/Stockholm wall clock
  end: string;
  price: string;
  payment?: string;
  beginnerClass?: string; // HH:MM | 'yes'
  music: Music;
  dj?: string;
  band?: string;
  organizer: string;
  url: string;
  description?: string;
  status: SeriesStatus;
  validFrom: string; // YYYY-MM-DD
  validTo?: string; // YYYY-MM-DD inclusive; empty = open-ended
}

export interface Exception {
  seriesId: string;
  date: string; // YYYY-MM-DD
  cancelled?: boolean;
  start?: string;
  end?: string;
  dj?: string;
  band?: string;
  music?: Music;
  price?: string;
  note?: string;
  description?: string;
}

export interface Oneoff {
  id: string;
  name: string;
  style: Style;
  venueId: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // inclusive; multi-day continuous events
  start: string;
  end: string;
  price?: string;
  payment?: string;
  beginnerClass?: string;
  music: Music;
  dj?: string;
  band?: string;
  organizer: string;
  url: string;
  description?: string;
  status: OneoffStatus;
}

// A concrete dated instance. Venue details (name/address/neighborhood) are
// joined from `venueId` downstream in #7; expansion only carries the id.
export interface Occurrence {
  occurrenceId: string; // `${sourceId}:${date}` — stable per day
  sourceId: string; // series id or oneoff id
  sourceType: 'series' | 'oneoff';
  date: string; // YYYY-MM-DD, Europe/Stockholm
  name: string;
  style: Style;
  venueId: string;
  start: string; // HH:MM wall clock
  end: string;
  price?: string;
  payment?: string;
  beginnerClass?: string;
  music: Music;
  dj?: string;
  band?: string;
  organizer: string;
  url: string;
  description?: string;
  cancelled: boolean;
  note?: string;
}

export interface ExpandOptions {
  today: string; // YYYY-MM-DD reference date (Europe/Stockholm)
  weeks?: number; // series expansion horizon; default 10
  includeDrafts?: boolean; // dev only; default false
  lookbackDays?: number; // include past occurrences up to N days ago; default 0
}
