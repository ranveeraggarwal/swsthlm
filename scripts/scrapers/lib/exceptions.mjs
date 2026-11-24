// Exception-proposal helpers: resolve what the calendar already says for a
// series occurrence, and compute which scraped fields genuinely changed.

export const EXCEPTION_FIELDS = [
  'series_id', 'date', 'cancelled', 'start', 'end', 'dj', 'band', 'music',
  'price', 'note', 'description',
];

// Fields the scraper can observe and that are worth proposing an exception for.
export const EXCEPTION_COMPARE_FIELDS = ['music', 'dj', 'band', 'start', 'end'];

// Price is compared loosely: the series row often carries the fuller string
// ("200 kr (150 kr för rabatterade); med prova-på-kurs 250 kr (200 kr)") while
// an event page shows only part of it. A scraped price the resolved one already
// contains is not a change; only a genuinely different (or newly present) price
// is proposed as an exception.
const norm = (x) => (x ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
const priceChanged = (scraped, resolved) =>
  norm(scraped) !== '' && !norm(resolved).includes(norm(scraped));

const val = (row, col) => (row?.[col] ?? '').trim();

// Merge series defaults with any existing exception to produce the current
// resolved values the scraper should compare a candidate against.
export function resolveOccurrence(seriesId, date, seriesData, exceptionsData) {
  const s = seriesData.rows.find((r) => val(r, 'id') === seriesId);
  const e = exceptionsData.rows.find(
    (r) => val(r, 'series_id') === seriesId && val(r, 'date') === date,
  );
  return {
    music: val(e, 'music') || val(s, 'music'),
    dj: val(e, 'dj') || val(s, 'dj'),
    band: val(e, 'band') || val(s, 'band'),
    start: val(e, 'start') || val(s, 'start'),
    end: val(e, 'end') || val(s, 'end'),
    price: val(e, 'price') || val(s, 'price'),
  };
}

// Candidate row → [{field, from, to}] for every field that actually changed.
// Only non-empty candidate values are considered — an empty field means
// "unknown to the scraper," not "should be blank." This prevents the runner
// from proposing to blank a human-curated band or DJ every night.
export function computeExceptionChanges(row, resolved) {
  const differs = (f) => (row[f] ?? '') !== '' && (row[f] ?? '') !== (resolved[f] ?? '');
  return [
    ...EXCEPTION_COMPARE_FIELDS.filter(differs),
    ...(priceChanged(row.price, resolved.price) ? ['price'] : []),
  ]
    .map((f) => ({ field: f, from: resolved[f] ?? '', to: row[f] ?? '' }));
}
