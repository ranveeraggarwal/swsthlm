import type { MetadataRoute } from 'next';
import { getPermalinkEvents } from '@/features/events/loader';
import { eventPath } from '@/features/events/model/event';
import { hreflangLanguages, localeUrl } from '@/lib/i18n';

// Lists the two static pages plus every pre-rendered event permalink (same
// set as generateStaticParams in the event route) — once per locale, since
// both trees are prerendered and both need to be indexed. Rebuilt on every
// deploy, so lastModified uses the data-directory timestamp baked in by
// next.config.
//
// Every entry carries the same `alternates.languages` map as the `<link
// rel="alternate">` tags in the corresponding document (#266). Both come from
// `hreflangLanguages`, so the sitemap and the pages cannot disagree — a
// mismatch is the classic way hreflang gets silently ignored.

/** One English + one Swedish entry for a path, hreflang-paired. */
function localePair(
  path: string,
  entry: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>,
): MetadataRoute.Sitemap {
  const alternates = { languages: hreflangLanguages(path) };
  return [
    { url: localeUrl('en', path), ...entry, alternates },
    { url: localeUrl('sv', path), ...entry, alternates },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dataUpdatedAt = process.env.NEXT_PUBLIC_DATA_UPDATED_AT
    ? new Date(process.env.NEXT_PUBLIC_DATA_UPDATED_AT)
    : new Date();

  const events = await getPermalinkEvents();

  return [
    ...localePair('/', {
      lastModified: dataUpdatedAt,
      changeFrequency: 'daily',
      priority: 1,
    }),
    ...localePair('/about', {
      changeFrequency: 'monthly',
      priority: 0.5,
    }),
    ...events.flatMap((event) =>
      localePair(eventPath(event), {
        lastModified: dataUpdatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      }),
    ),
  ];
}
