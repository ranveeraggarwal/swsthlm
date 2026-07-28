// Canonical + hreflang wiring for the two locale trees (#266).
//
// Google ignores one-directional hreflang: if `/about` advertises `/sv/about`
// but `/sv/about` doesn't point back, both annotations are discarded and the
// Swedish tree competes with the English one instead of pairing with it. The
// only reliable way to guarantee reciprocity is to never write the pair twice
// — so every route in both trees calls `localeAlternates` with the *same*
// English path and gets an identical `languages` map out. The canonical is the
// only part that differs per locale.
//
// This is also why the sitemap imports from here rather than rebuilding URLs:
// the `<xhtml:link>` alternates it emits have to agree with the `<link>` tags
// in the documents themselves.

import { SITE_URL } from '@/lib/site';
import { DEFAULT_LOCALE, localePath, stripLocale, type Locale } from './locale';

/**
 * Absolute URL for a path in a given locale. Accepts either the English path
 * (`/about`) or an already-prefixed one (`/sv/about`) — `stripLocale` makes it
 * idempotent, so callers never have to track which form they're holding.
 *
 * Always on `SITE_URL`: hreflang and sitemap URLs are cross-referenced by
 * crawlers and must not resolve to a Vercel preview host.
 */
export function localeUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${localePath(locale, stripLocale(path))}`;
}

/**
 * The `hreflang` map for a page, keyed the way `alternates.languages` and
 * `MetadataRoute.Sitemap`'s `alternates.languages` both expect.
 *
 * `x-default` points at English: it's the fallback for visitors whose language
 * we don't publish, and English is the unprefixed, already-indexed tree.
 */
export function hreflangLanguages(path: string) {
  const english = localeUrl(DEFAULT_LOCALE, path);
  return {
    en: english,
    sv: localeUrl('sv', path),
    'x-default': english,
  };
}

/**
 * A page's complete `alternates` metadata: canonical to *itself* (a `/sv` page
 * that canonicalised to `/` would drop straight out of the index — that's the
 * whole point of prerendering the tree) plus the shared reciprocal hreflang
 * map.
 *
 * Pass the English path; the locale argument decides the canonical.
 */
export function localeAlternates(locale: Locale, path: string) {
  return {
    canonical: localeUrl(locale, path),
    languages: hreflangLanguages(path),
  };
}
