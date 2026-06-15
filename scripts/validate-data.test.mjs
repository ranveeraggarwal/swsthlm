import { describe, expect, it } from 'vitest';
import { validateData, collectUrls } from './validate-data.mjs';

const TODAY = '2026-06-13';

// Full header sets so row tests don't trip the column checks.
const FIELDS = {
  venues: ['id', 'name', 'address', 'neighborhood', 'lat', 'lng', 'maps_url'],
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
  it('errors when a live one-off is entirely in the past', () => {
    const { errors } = run({ oneoffs: { rows: [oneoff({ date: '2026-06-01' })] } });
    expect(joined(errors)).toMatch(/entirely in the past/);
  });

  it('does not error on a cancelled past one-off (history is allowed)', () => {
    const { errors } = run({ oneoffs: { rows: [oneoff({ date: '2026-06-01', status: 'cancelled' })] } });
    expect(errors).toEqual([]);
  });

  it('does not error on an ended past one-off (kept for the archive)', () => {
    const { errors } = run({ oneoffs: { rows: [oneoff({ date: '2026-06-01', status: 'ended' })] } });
    expect(errors).toEqual([]);
  });

  it('honours end_date — a multi-day run ending today is not past', () => {
    const { errors } = run({ oneoffs: { rows: [oneoff({ date: '2026-06-11', end_date: '2026-06-13' })] } });
    expect(errors).toEqual([]);
  });
});

describe('warnings (non-failing)', () => {
  it('warns on a date-like string in a description', () => {
    const { errors, warnings } = run({ series: { rows: [series({ description: 'Kom på lördag 14/3!' })] } });
    expect(errors).toEqual([]);
    expect(joined(warnings)).toMatch(/date-like/);
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
