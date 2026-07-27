// Mirrors `app/(en)/event/[id]/[date]/page.tsx`. Same occurrence set, same
// `EventPermalinkArticle`; only `backHref`, the canonical URL, and the OG
// `url` point at the `/sv` tree. No sibling `opengraph-image.tsx` here on
// purpose — #260 doesn't mirror per-event OG images, see issue #259's
// out-of-scope list. Unlike `/sv` and `/sv/about` (which use a static
// `metadata` export and so still pick up `app/sv/opengraph-image.tsx` as a
// fallback), this route uses `generateMetadata`, which Next does not
// auto-merge a fallback image into — so these permalinks currently render
// with no `og:image` at all. #266 is where that gets decided (most likely an
// explicit `openGraph.images` pointing at the English permalink's image).

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { formatEventDate } from '@/lib/date/format';
import { EventPermalinkArticle } from '@/features/events/components/EventPermalinkArticle';
import { singleEventJsonLd } from '@/features/events/jsonld';
import { findPermalinkEvent, permalinkStaticParams } from '@/features/events/loader';

export const dynamicParams = false;

export const generateStaticParams = permalinkStaticParams;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; date: string }>;
}): Promise<Metadata> {
  const { id, date } = await params;
  const event = await findPermalinkEvent(id, date);
  if (!event) return {};

  const title = `${event.title} — ${formatEventDate(event.date)} at ${event.venue}`;
  const description = [
    `${event.start}–${event.end}`,
    event.price ?? null,
    event.body ? event.body.slice(0, 140) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    title,
    description,
    alternates: { canonical: `/sv/event/${id}/${date}` },
    openGraph: { title, description, url: `/sv/event/${id}/${date}`, type: 'website' },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string; date: string }>;
}) {
  const { id, date } = await params;
  const event = await findPermalinkEvent(id, date);
  if (!event) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: singleEventJsonLd(event) }}
      />
      <EventPermalinkArticle event={event} backHref="/sv" />
    </div>
  );
}
