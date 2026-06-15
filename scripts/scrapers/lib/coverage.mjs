const val = (row, col) => (row[col] ?? '').trim();

export function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const WEEKDAY_BY_INDEX = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

export const weekdayOf = (iso) => WEEKDAY_BY_INDEX[new Date(`${iso}T00:00:00Z`).getUTCDay()];

/**
 * Every (venue_id|date) already on the calendar: one-off date ranges, plus
 * series occurrences (a series occupies a date iff venue+weekday match and the
 * date is inside [valid_from, valid_to] and it isn't ended/draft). This mirrors
 * expand.ts's notion of coverage without stepping, so there's no DST exposure.
 */
export function buildCoverage(oneoffs, series) {
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
