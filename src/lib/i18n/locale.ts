// The two site locales. English is unprefixed at `/`; Swedish is prerendered
// at `/sv/*` — both static at build time, no middleware and no `[locale]`
// dynamic segment. See docs/architecture/CODE_STRUCTURE.md and issue #259 for
// why: permalinks are shared, sitemapped, and embedded in ICS entries, so the
// unprefixed English URLs must never move.

export type Locale = 'en' | 'sv';

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALES: readonly Locale[] = ['en', 'sv'];

const LOCALE_PREFIX = '/sv';

/**
 * An English (unprefixed) path to its equivalent for `locale`.
 * `localePath('en', p) === p`; `localePath('sv', '/about') === '/sv/about'`.
 * Round-trips with `stripLocale`.
 */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? LOCALE_PREFIX : `${LOCALE_PREFIX}${path}`;
}

/**
 * The reverse of `localePath`: drops a leading `/sv` so the result is the
 * bare English path regardless of which locale's page you're currently on.
 */
export function stripLocale(pathname: string): string {
  if (pathname === LOCALE_PREFIX) return '/';
  if (pathname.startsWith(`${LOCALE_PREFIX}/`)) return pathname.slice(LOCALE_PREFIX.length);
  return pathname;
}
