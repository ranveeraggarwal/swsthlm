// "3 minutes ago" / "3 minuter sedan" — the elapsed-time phrase under the
// footer's freshness signal.
//
// Two deliberate choices, both inherited from `format.ts`:
//
//  1. **No `Intl.PluralRules`.** English and Swedish both need exactly two
//     forms at this volume (four units × two forms = eight strings), and a
//     hand-written table is byte-identical between Node and every browser —
//     the same reason `format.ts` avoids `Intl.DateTimeFormat`. A CLDR plural
//     category lookup buys nothing here and reintroduces the ICU dependency.
//  2. **The reference instant is an argument, not `Date.now()`.**
//     `lib/date/clock.ts` is the only module allowed to read the clock, so
//     this stays pure and testable at exact boundaries.
//
// Lives in `lib/date/` rather than inside `FreshnessSignal.tsx` so the plural
// boundaries (1 vs 2, and the 60/24/7 rollovers) can be unit-tested without a
// DOM; the component is a thin caller.

import type { Locale } from '@/lib/i18n/locale';

/** The two forms every unit needs. `other` covers 0 and 2+. */
type PluralForms = { one: string; other: string };

type RelativeWords = {
  /** Under a minute, and any clock skew that puts the timestamp in the future. */
  justNow: string;
  units: {
    minute: PluralForms;
    hour: PluralForms;
    day: PluralForms;
    week: PluralForms;
  };
  /**
   * Wraps a counted unit ("2 minuter") into the full phrase. Both languages
   * happen to suffix it — "ago" / "sedan" — but keeping it a template means a
   * locale that prefixes ("för 2 minuter sedan") stays a one-line change.
   */
  ago: (countedUnit: string) => string;
};

const RELATIVE: Record<Locale, RelativeWords> = {
  en: {
    justNow: 'just now',
    units: {
      minute: { one: 'minute', other: 'minutes' },
      hour: { one: 'hour', other: 'hours' },
      day: { one: 'day', other: 'days' },
      week: { one: 'week', other: 'weeks' },
    },
    ago: (countedUnit) => `${countedUnit} ago`,
  },
  // Swedish pluralises by declension class, not by a suffix rule, so every
  // form is spelled out: minut/minuter, timme/timmar, dag/dagar, vecka/veckor.
  sv: {
    justNow: 'nyss',
    units: {
      minute: { one: 'minut', other: 'minuter' },
      hour: { one: 'timme', other: 'timmar' },
      day: { one: 'dag', other: 'dagar' },
      week: { one: 'vecka', other: 'veckor' },
    },
    ago: (countedUnit) => `${countedUnit} sedan`,
  },
};

/** "1 minute" / "2 minuter" — count plus the correctly inflected unit. */
function counted(count: number, forms: PluralForms): string {
  return `${count} ${count === 1 ? forms.one : forms.other}`;
}

/**
 * How long ago `isoDate` was, relative to `now` (epoch milliseconds).
 *
 * Resolution steps down through minutes, hours and days before settling on
 * weeks — there is no month or year form, because the freshness signal is
 * about a data file that updates several times a week and "27 weeks ago" is a
 * more useful alarm than "6 months ago".
 */
export function formatRelativeTime(
  isoDate: string,
  now: number,
  locale: Locale = 'en',
): string {
  const words = RELATIVE[locale];
  const timestamp = new Date(isoDate).getTime();
  if (isNaN(timestamp)) return words.justNow;

  const diff = now - timestamp;
  if (diff < 0) return words.justNow;

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return words.justNow;
  if (minutes < 60) return words.ago(counted(minutes, words.units.minute));

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return words.ago(counted(hours, words.units.hour));

  const days = Math.floor(hours / 24);
  if (days < 7) return words.ago(counted(days, words.units.day));

  const weeks = Math.floor(days / 7);
  return words.ago(counted(weeks, words.units.week));
}
