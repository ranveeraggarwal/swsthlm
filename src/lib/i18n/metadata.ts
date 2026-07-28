// Per-locale Open Graph blocks (#266).
//
// This exists because of a sharp edge in Next's metadata merging: nested
// objects are **replaced, not merged**. A page that exports
// `openGraph: { title, description }` doesn't add to the root layout's
// `openGraph: { siteName, locale, type }` — it overwrites it wholesale, and
// the layout's fields vanish from the HTML.
//
// That had already silently cost the English site its `og:site_name`,
// `og:type` and `og:locale` on the homepage and every permalink: the tags were
// declared in the layout, overridden by each page, and emitted nowhere. So
// setting `locale: 'sv'` in `app/sv/layout.tsx` alone would have changed
// nothing observable. Every page has to spell the whole block out, which means
// it belongs in one function rather than six copies.
//
// The same replace-don't-merge rule has a sharp corollary for images, and it
// decides which routes may call this at all:
//
//   - A **sibling** `opengraph-image.tsx` (same segment as the page) is merged
//     in afterwards and survives. The homepages and the English permalinks
//     have one, so they can safely declare `openGraph` here.
//   - An **inherited** one, from a parent segment, is part of the *parent's*
//     block — so a page declaring its own `openGraph` throws it away. The
//     About pages inherit the site image that way and therefore deliberately
//     don't call this function; see the note in `app/(en)/about/page.tsx`.
//
// `images` is only passed where a route has no sibling image and needs to name
// one explicitly: the Swedish permalinks, which borrow the English one.

import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';
import { localeUrl } from './alternates';
import type { Locale } from './locale';

/** The other locale — what `og:locale:alternate` announces. */
const OTHER_LOCALE: Record<Locale, Locale> = { en: 'sv', sv: 'en' };

export function localeOpenGraph(
  locale: Locale,
  page: {
    title: string;
    description: string;
    /** English path; `localeUrl` prefixes it for the Swedish tree. */
    path: string;
    /** Absolute image URLs. Omit to let a sibling `opengraph-image` apply. */
    images?: string[];
  },
): Metadata['openGraph'] {
  return {
    type: 'website',
    siteName: SITE_NAME,
    locale,
    alternateLocale: OTHER_LOCALE[locale],
    title: page.title,
    description: page.description,
    url: localeUrl(locale, page.path),
    ...(page.images ? { images: page.images } : {}),
  };
}
