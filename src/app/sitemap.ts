import type { MetadataRoute } from 'next';
import { getPermalinkEvents } from '@/lib/events';

const SITE_URL = 'https://stockholmswing.com';

// Lists the two static pages plus every pre-rendered event permalink (same
// set as generateStaticParams in the event route). Rebuilt on every deploy,
// so lastModified uses the data-directory timestamp baked in by next.config.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dataUpdatedAt = process.env.NEXT_PUBLIC_DATA_UPDATED_AT
    ? new Date(process.env.NEXT_PUBLIC_DATA_UPDATED_AT)
    : new Date();

  const events = await getPermalinkEvents();

  return [
    {
      url: SITE_URL,
      lastModified: dataUpdatedAt,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...events.map((event) => ({
      url: `${SITE_URL}/event/${event.id.split(':')[0]}/${event.date}`,
      lastModified: dataUpdatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
