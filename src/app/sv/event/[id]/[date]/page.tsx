// Mirrors `app/(en)/event/[id]/[date]/page.tsx`. Same occurrence set, same
// `EventPermalinkArticle`; only `backHref`, the canonical URL, and the OG
// `url` point at the `/sv` tree.
//
// No sibling `opengraph-image.tsx` here on purpose — per-event OG images
// aren't mirrored, see issue #259's out-of-scope list. Unlike `/sv` and
// `/sv/about` (which use a static `metadata` export and so still pick up
// `app/sv/opengraph-image.tsx` as a fallback), this route uses
// `generateMetadata`, which Next does not auto-merge a fallback image into —
// so these permalinks rendered with no `og:image` at all. #266 closes that by
// pointing `openGraph.images` at the English permalink's satori route: the
// image is a picture of the event, and the event is the same event. Rendering
// a second copy of it under `/sv` would cost another ~90 build-time images to
// change nothing a sharer would notice.

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { formatEventDate } from '@/lib/date/format';
import { EventPermalinkArticle } from '@/features/events/components/EventPermalinkArticle';
import { singleEventJsonLd } from '@/features/events/jsonld';
import { findPermalinkEvent, permalinkStaticParams } from '@/features/events/loader';
import { eventPath } from '@/features/events/model/event';
import { dictionary, localeAlternates, localeOpenGraph, localeUrl } from '@/lib/i18n';

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

  // The title and description are mostly data — `event.title`, the venue and
  // the organizer's own body copy stay in whatever language they were written
  // in (PROJECT.md §5). Only the connective tissue is translated; the date
  // itself becomes Swedish with S2 (#261), which owns `formatEventDate`.
  const t = dictionary('sv').meta.event;
  const title = `${event.title} — ${formatEventDate(event.date)} ${t.venuePreposition} ${event.venue}`;
  const description = [
    `${event.start}–${event.end}`,
    event.price ?? null,
    event.body ? event.body.slice(0, 140) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const path = eventPath(event);

  return {
    title,
    description,
    alternates: localeAlternates('sv', path),
    openGraph: localeOpenGraph('sv', {
      title,
      description,
      path,
      images: [localeUrl('en', `${path}/opengraph-image`)],
    }),
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
