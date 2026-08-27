import { describe, expect, it } from 'vitest';
import { validateData, collectUrls } from './validate-data.mjs';

const TODAY = '2026-06-13';

// Full header sets so row tests don't trip the column checks.
const FIELDS = {
  venues: ['id', 'name', 'address', 'neighborhood', 'lat', 'lng', 'maps_url', 'floor_type'],
  series: ['id', 'name', 'style', 'venue_id', 'weekday', 'start', 'end', 'price', 'payment', 'beginner_class', 'music', 'dj', 'band', 'organizer', 'url', 'description', 'status', 'valid_from', 'valid_to'],
  exceptions: ['series_id', 'date', 'cancelled', 'start', 'end', 'dj', 'band', 'music', 'price', 'note', 'description'],
  oneoffs: ['id', 'name', 'style', 'venue_id', 'date', 'end_date', 'start', 'end', 'price', 'payment', 'beginner_class', 'music', 'dj', 'band', 'organizer', 'url', 'description', 'status'],
  bands: ['id', 'name', 'aliases', 'style', 'swing', 'notes'],
};

const venue = (o = {}) => ({ id: 'chicago', name: 'Chicago', address: 'Hornsgatan 75', neighborhood: 'Söder', ...o });
const series = (o = {}) => ({ id: 's1', name: 'S1', style: 'all', venue_id: 'chicago', weekday: 'wednesday', start: '19:00', end: '23:00', price: '100 kr', music: 'live', organizer: 'Org', url: 'https://x.test', status: 'live', valid_from: '2026-06-03', ...o });
const oneoff = (o = {}) => ({ id: 'o1', name: 'O1', style: 'all', venue_id: 'chicago', date: '2026-06-28', start: '19:00', end: '22:00', music: 'live', organizer: 'Org', url: 'https://x.test', status: 'live', ...o });
const band = (o = {}) => ({ id: 'b1', name: 'Some Swing Band', aliases: '', style: 'all', swing: 'yes', notes: '', ...o });

// Build a datasets object, defaulting fields to the full header set. venues
// defaults to a single chicago row so the common venue_id reference resolves
// unless a test overrides it.
function ds(parts) {
  const out = {};
  for (const file of ['venues', 'series', 'exceptions', 'oneoffs', 'bands']) {
    const p = parts[file] ?? {};
    const defaultRows = file === 'venues' ? [venue()] : [];
    out[file] = { fields: p.fields ?? FIELDS[file], rows: p.rows ?? defaultRows };
  }
  return out;
}

const run = (parts, today = TODAY) => validateData(ds(parts), { today });
const joined = (arr) => arr.join('\n');

describe('happy path', () => {
  it('valid data yields no errors', () => {
    const { errors } = run({
      venues: { rows: [venue()] },
      series: { rows: [series()] },
      oneoffs: { rows: [oneoff()] },
    });
    expect(errors).toEqual([]);
  });
});

describe('column checks', () => {
  it('flags a missing required column', () => {
    const { errors } = run({ series: { fields: FIELDS.series.filter((f) => f !== 'venue_id'), rows: [] } });
    expect(joined(errors)).toMatch(/missing required column "venue_id"/);
  });

  it('flags an unknown column', () => {
    const { errors } = run({ venues: { fields: [...FIELDS.venues, 'colour'], rows: [] } });
    expect(joined(errors)).toMatch(/unknown column "colour"/);
  });
});

describe('enums', () => {
  it('rejects bad style/music/status/weekday', () => {
    const { errors } = run({
      series: { rows: [series({ style: 'tango', music: 'orchestra', status: 'published', weekday: 'someday' })] },
    });
    const j = joined(errors);
    expect(j).toMatch(/invalid style "tango"/);
    expect(j).toMatch(/invalid music "orchestra"/);
    expect(j).toMatch(/invalid status "published"/);
    expect(j).toMatch(/invalid weekday "someday"/);
  });

  it('rejects a bad venue floor_type but allows it blank', () => {
    const { errors } = run({ venues: { rows: [venue({ floor_type: 'huge' })] } });
    expect(joined(errors)).toMatch(/invalid floor_type "huge"/);

    const { errors: okErrors } = run({ venues: { rows: [venue({ floor_type: '' })] } });
    expect(okErrors).toEqual([]);
  });

  it('accepts every valid floor_type', () => {
    for (const floorType of ['studio', 'hall', 'bar', 'outdoor']) {
      const { errors } = run({ venues: { rows: [venue({ floor_type: floorType })] } });
      expect(errors).toEqual([]);
    }
  });
});

describe('required emptiness', () => {
  it('errors on an empty structurally-required field', () => {
    const { errors } = run({ series: { rows: [series({ venue_id: '' })] } });
    expect(joined(errors)).toMatch(/required field "venue_id" is empty/);
  });

  it('only warns on empty price (soft) and empty neighborhood (soft)', () => {
    const { errors, warnings } = run({
      series: { rows: [series({ price: '' })] },
      venues: { rows: [venue({ neighborhood: '' })] },
    });
    expect(errors).toEqual([]);
    expect(joined(warnings)).toMatch(/"price" is empty/);
    expect(joined(warnings)).toMatch(/"neighborhood" is empty/);
  });

  it('errors on empty end time in a oneoff', () => {
    const { errors } = run({ oneoffs: { rows: [oneoff({ end: '' })] } });
    expect(joined(errors)).toMatch(/required field "end" is empty/);
  });
});

describe('dates and times', () => {
  it('rejects malformed dates and times', () => {
    const { errors } = run({
      series: { rows: [series({ valid_from: '2026-13-40', start: '25:00', end: '7:5' })] },
    });
    const j = joined(errors);
    expect(j).toMatch(/valid_from is not a real date/);
    expect(j).toMatch(/"start" is not HH:MM/);
    expect(j).toMatch(/"end" is not HH:MM/);
  });

  it('accepts beginner_class of "yes" or a time, rejects junk', () => {
    expect(run({ series: { rows: [series({ beginner_class: 'yes' })] } }).errors).toEqual([]);
    expect(run({ series: { rows: [series({ beginner_class: '19:00' })] } }).errors).toEqual([]);
    expect(joined(run({ series: { rows: [series({ beginner_class: 'soonish' })] } }).errors)).toMatch(/beginner_class/);
  });
});

describe('referential integrity', () => {
  it('flags a dangling venue_id', () => {
    const { errors } = run({ venues: { rows: [venue()] }, series: { rows: [series({ venue_id: 'ghost' })] } });
    expect(joined(errors)).toMatch(/venue_id "ghost" not found/);
  });

  it('flags a dangling series_id in exceptions', () => {
    const { errors } = run({
      series: { rows: [series({ id: 's1' })] },
      exceptions: { rows: [{ series_id: 'nope', date: '2026-06-03' }] },
    });
    expect(joined(errors)).toMatch(/series_id "nope" not found/);
  });
});

describe('exception weekday must match series', () => {
  it('errors when the date falls on the wrong weekday', () => {
    // s1 runs Wednesday; 2026-06-04 is a Thursday.
    const { errors } = run({
      series: { rows: [series({ id: 's1', weekday: 'wednesday' })] },
      exceptions: { rows: [{ series_id: 's1', date: '2026-06-04' }] },
    });
    expect(joined(errors)).toMatch(/is a thursday, but series "s1" runs on wednesday/);
  });

  it('passes when the date is on the right weekday', () => {
    const { errors } = run({
      series: { rows: [series({ id: 's1', weekday: 'wednesday' })] },
      exceptions: { rows: [{ series_id: 's1', date: '2026-06-03' }] },
    });
    expect(errors).toEqual([]);
  });
});

describe('duplicate ids', () => {
  it('flags duplicate ids within a file', () => {
    const { errors } = run({ oneoffs: { rows: [oneoff({ id: 'dup' }), oneoff({ id: 'dup' })] } });
    expect(joined(errors)).toMatch(/duplicate id "dup"/);
  });
});

describe('past live one-off', () => {
  it('warns, but does not error, on a recently-passed live one-off', () => {
    // Inside the grace period the nightly mark-ended job owns this fix; failing
    // here would redden every open PR while its review PR waits to be merged.
    const { errors, warnings } = run({ oneoffs: { rows: [oneoff({ date: '2026-06-01' })] } });
    expect(errors).toEqual([]);
    expect(joined(warnings)).toMatch(/entirely in the past/);
  });

  it('still warns rather than errors on the last day of the grace period', () => {
    const { errors, warnings } = run({ oneoffs: { rows: [oneoff({ date: '2026-05-14' })] } });
    expect(errors).toEqual([]);
    expect(joined(warnings)).toMatch(/entirely in the past/);
  });

  it('errors once a live one-off is stale beyond the grace period', () => {
    const { errors } = run({ oneoffs: { rows: [oneoff({ date: '2026-05-13' })] } });
    expect(joined(errors)).toMatch(/entirely in the past/);
    expect(joined(errors)).toMatch(/mark-ended job/);
  });

  it('measures staleness from end_date on a multi-day run', () => {
    // The run started well beyond the grace period but ended inside it.
    const { errors, warnings } = run({ oneoffs: { rows: [oneoff({ date: '2026-04-01', end_date: '2026-06-01' })] } });
    expect(errors).toEqual([]);
    expect(joined(warnings)).toMatch(/entirely in the past/);
  });

  it('does not error on a cancelled past one-off (history is allowed)', () => {
    const { errors } = run({ oneoffs: { rows: [oneoff({ date: '2026-06-01', status: 'cancelled' })] } });
    expect(errors).toEqual([]);
  });

  it('does not error on an ended past one-off (kept for the archive)', () => {
    const { errors, warnings } = run({ oneoffs: { rows: [oneoff({ date: '2026-06-01', status: 'ended' })] } });
    expect(errors).toEqual([]);
    expect(joined(warnings)).not.toMatch(/entirely in the past/);
  });

  it('honours end_date — a multi-day run ending today is not past', () => {
    const { errors } = run({ oneoffs: { rows: [oneoff({ date: '2026-06-11', end_date: '2026-06-13' })] } });
    expect(errors).toEqual([]);
  });
});

describe('warnings (non-failing)', () => {
  it('warns on a DD/MM date in a description', () => {
    const { errors, warnings } = run({ series: { rows: [series({ description: 'Kom på lördag 14/3!' })] } });
    expect(errors).toEqual([]);
    expect(joined(warnings)).toMatch(/date-like/);
  });

  it('warns on a textual sv date (number + month name)', () => {
    const { warnings } = run({ oneoffs: { rows: [oneoff({ description: 'Vi ses den 14 mars för dans!' })] } });
    expect(joined(warnings)).toMatch(/date-like/);
  });

  it('warns on a textual en date (month name + number)', () => {
    const { warnings } = run({ oneoffs: { rows: [oneoff({ description: 'Join us March 14 for dancing' })] } });
    expect(joined(warnings)).toMatch(/date-like/);
  });

  it('does not warn on bare weekday names (valid recurring-series language)', () => {
    const { warnings } = run({ series: { rows: [series({ description: 'Dance every Saturday and Wednesday night' })] } });
    expect(joined(warnings)).not.toMatch(/date-like/);
  });

  it('warns when valid_to is within 4 weeks', () => {
    const { warnings } = run({ series: { rows: [series({ valid_to: '2026-06-17' })] } });
    expect(joined(warnings)).toMatch(/within 4 weeks/);
  });

  it('warns on TBA dj/band', () => {
    const { warnings } = run({ series: { rows: [series({ band: 'TBA' })] } });
    expect(joined(warnings)).toMatch(/"band" is TBA/);
  });
});

describe('clash detection (#93)', () => {
  it('warns when two live oneoffs at the same venue overlap in time on the same date', () => {
    const { errors, warnings } = run({
      oneoffs: {
        rows: [
          oneoff({ id: 'o1', date: '2026-07-11', start: '19:00', end: '22:00' }),
          oneoff({ id: 'o2', date: '2026-07-11', start: '20:00', end: '23:00' }),
        ],
      },
    });
    expect(errors).toEqual([]);
    expect(joined(warnings)).toMatch(/overlaps with oneoffs\.csv:row 3 \("o2"\).*2026-07-11.*possible duplicate entry/);
  });

  it('does not warn when two oneoffs at the same venue do not overlap in time', () => {
    const { warnings } = run({
      oneoffs: {
        rows: [
          oneoff({ id: 'o1', date: '2026-07-11', start: '19:00', end: '20:00' }),
          oneoff({ id: 'o2', date: '2026-07-11', start: '20:00', end: '22:00' }),
        ],
      },
    });
    expect(joined(warnings)).not.toMatch(/possible duplicate entry/);
  });

  it('does not warn when two oneoffs overlap in time but not venue or date', () => {
    const { warnings } = run({
      venues: { rows: [venue({ id: 'chicago' }), venue({ id: 'other' })] },
      oneoffs: {
        rows: [
          oneoff({ id: 'o1', venue_id: 'chicago', date: '2026-07-11', start: '19:00', end: '22:00' }),
          oneoff({ id: 'o2', venue_id: 'other', date: '2026-07-11', start: '19:00', end: '22:00' }),
        ],
      },
    });
    expect(joined(warnings)).not.toMatch(/possible duplicate entry/);
  });

  it('does not warn on overlapping oneoffs when one is cancelled', () => {
    const { warnings } = run({
      oneoffs: {
        rows: [
          oneoff({ id: 'o1', date: '2026-07-11', start: '19:00', end: '22:00' }),
          oneoff({ id: 'o2', date: '2026-07-11', start: '20:00', end: '23:00', status: 'cancelled' }),
        ],
      },
    });
    expect(joined(warnings)).not.toMatch(/possible duplicate entry/);
  });

  it('warns once for a multi-day oneoff overlapping another across a shared date', () => {
    const { warnings } = run({
      oneoffs: {
        rows: [
          oneoff({ id: 'o1', date: '2026-08-28', end_date: '2026-08-29', start: '19:00', end: '22:00' }),
          oneoff({ id: 'o2', date: '2026-08-29', start: '19:30', end: '22:00' }),
        ],
      },
    });
    expect(warnings.filter((w) => /possible duplicate entry/.test(w))).toHaveLength(1);
    expect(joined(warnings)).toMatch(/2026-08-29/);
  });

  it('warns when two live series share a venue, weekday, overlapping validity and overlapping time', () => {
    const { warnings } = run({
      series: {
        rows: [
          series({ id: 's1', weekday: 'wednesday', start: '19:00', end: '23:00', valid_from: '2026-06-01' }),
          series({ id: 's2', weekday: 'wednesday', start: '20:00', end: '22:00', valid_from: '2026-06-01' }),
        ],
      },
    });
    expect(joined(warnings)).toMatch(/overlaps with series\.csv:row 3 \("s2"\).*possible duplicate entry/);
  });

  it('does not warn on same-weekday series whose validity windows never overlap', () => {
    const { warnings } = run({
      series: {
        rows: [
          series({ id: 's1', weekday: 'wednesday', valid_from: '2026-01-01', valid_to: '2026-03-01' }),
          series({ id: 's2', weekday: 'wednesday', valid_from: '2026-04-01' }),
        ],
      },
    });
    expect(joined(warnings)).not.toMatch(/possible duplicate entry/);
  });

  it('does not warn on same-weekday, same-time series at different venues', () => {
    const { warnings } = run({
      venues: { rows: [venue({ id: 'chicago' }), venue({ id: 'other' })] },
      series: {
        rows: [
          series({ id: 's1', venue_id: 'chicago', weekday: 'wednesday' }),
          series({ id: 's2', venue_id: 'other', weekday: 'wednesday' }),
        ],
      },
    });
    expect(joined(warnings)).not.toMatch(/possible duplicate entry/);
  });

  it('warns when a oneoff duplicates a series occurrence at the same venue', () => {
    // s1 runs Wednesdays 19:00-23:00; 2026-07-08 is a Wednesday within its window.
    const { warnings } = run({
      series: { rows: [series({ id: 's1', weekday: 'wednesday', start: '19:00', end: '23:00', valid_from: '2026-01-01' })] },
      oneoffs: { rows: [oneoff({ id: 'o1', date: '2026-07-08', start: '19:00', end: '22:00' })] },
    });
    expect(joined(warnings)).toMatch(/overlaps with series\.csv:row 2 \("s1"\).*2026-07-08.*possible duplicate entry/);
  });

  it('does not warn when the series occurrence is cancelled that date', () => {
    const { warnings } = run({
      series: { rows: [series({ id: 's1', weekday: 'wednesday', start: '19:00', end: '23:00', valid_from: '2026-01-01' })] },
      exceptions: { rows: [{ series_id: 's1', date: '2026-07-08', cancelled: 'yes' }] },
      oneoffs: { rows: [oneoff({ id: 'o1', date: '2026-07-08', start: '19:00', end: '22:00' })] },
    });
    expect(joined(warnings)).not.toMatch(/possible duplicate entry/);
  });

  it('does not warn when an exception shifts the series time out of overlap', () => {
    const { warnings } = run({
      series: { rows: [series({ id: 's1', weekday: 'wednesday', start: '19:00', end: '23:00', valid_from: '2026-01-01' })] },
      exceptions: { rows: [{ series_id: 's1', date: '2026-07-08', start: '22:30', end: '23:30' }] },
      oneoffs: { rows: [oneoff({ id: 'o1', date: '2026-07-08', start: '19:00', end: '22:00' })] },
    });
    expect(joined(warnings)).not.toMatch(/possible duplicate entry/);
  });

  it('does not error on malformed times — those are already flagged elsewhere', () => {
    const { errors } = run({
      oneoffs: {
        rows: [
          oneoff({ id: 'o1', date: '2026-07-11', start: '19:00', end: '22:00' }),
          oneoff({ id: 'o2', date: '2026-07-11', start: 'bad', end: '23:00' }),
        ],
      },
    });
    // Malformed time is a schema error, not a crash in the clash checker.
    expect(joined(errors)).toMatch(/"start" is not HH:MM/);
  });

  it('handles overnight windows (end <= start means past midnight) on the same date', () => {
    const { warnings } = run({
      oneoffs: {
        rows: [
          oneoff({ id: 'o1', date: '2026-07-11', start: '22:00', end: '02:00' }),
          oneoff({ id: 'o2', date: '2026-07-11', start: '23:00', end: '01:30' }),
        ],
      },
    });
    expect(joined(warnings)).toMatch(/possible duplicate entry/);
  });

  it('does not treat an early-morning event as overlapping the previous night on a different date', () => {
    // o1 is dated the 11th and runs past midnight into the 12th; o2 is
    // dated the 12th itself. Clash detection compares literal `date`
    // values only, so these are correctly not matched — a full wall-clock
    // instant comparison across a date boundary is out of scope here.
    const { warnings } = run({
      oneoffs: {
        rows: [
          oneoff({ id: 'o1', date: '2026-07-11', start: '22:00', end: '02:00' }),
          oneoff({ id: 'o2', date: '2026-07-12', start: '01:00', end: '03:00' }),
        ],
      },
    });
    expect(joined(warnings)).not.toMatch(/possible duplicate entry/);
  });
});

describe('bands registry', () => {
  it('accepts a valid band row', () => {
    expect(run({ bands: { rows: [band()] } }).errors).toEqual([]);
  });

  it('rejects an invalid swing flag', () => {
    const { errors } = run({ bands: { rows: [band({ swing: 'maybe' })] } });
    expect(joined(errors)).toMatch(/invalid swing "maybe"/);
  });

  it('rejects an invalid style and a duplicate id', () => {
    const { errors } = run({ bands: { rows: [band({ style: 'tango' }), band({ id: 'b1' })] } });
    const j = joined(errors);
    expect(j).toMatch(/invalid style "tango"/);
    expect(j).toMatch(/duplicate id "b1"/);
  });

  it('errors on an empty required field (swing)', () => {
    const { errors } = run({ bands: { rows: [band({ swing: '' })] } });
    expect(joined(errors)).toMatch(/required field "swing" is empty/);
  });
});

describe('collectUrls', () => {
  it('gathers urls from series and oneoffs', () => {
    const urls = collectUrls(ds({
      series: { rows: [series({ url: 'https://a.test' })] },
      oneoffs: { rows: [oneoff({ url: 'https://b.test' })] },
    }));
    expect(urls.map((u) => u.url)).toEqual(['https://a.test', 'https://b.test']);
  });
});
