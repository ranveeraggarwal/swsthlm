// Exception-proposal helpers: resolve what the calendar already says for a
// series occurrence, and compute which scraped fields genuinely changed.

export const EXCEPTION_FIELDS = [
  'series_id', 'date', 'cancelled', 'start', 'end', 'dj', 'band', 'music',
  'price', 'note', 'description',
];

// Fields the scraper can observe and that are worth proposing an exception for.
export const EXCEPTION_COMPARE_FIELDS = ['music', 'dj', 'band', 'start', 'end'];

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
  };
}

// Candidate row → [{field, from, to}] for every field that actually changed.
// Only non-empty candidate values are considered — an empty field means
// "unknown to the scraper," not "should be blank." This prevents the runner
// from proposing to blank a human-curated band or DJ every night.
export function computeExceptionChanges(row, resolved) {
  return EXCEPTION_COMPARE_FIELDS
    .filter((f) => (row[f] ?? '') !== '' && (row[f] ?? '') !== (resolved[f] ?? ''))
    .map((f) => ({ field: f, from: resolved[f] ?? '', to: row[f] ?? '' }));
}
