// Statically-generated event permalink: `/event/[series-or-oneoff-id]/[YYYY-MM-DD]`.
//
// IDs are immutable per docs/DATA.md, so these URLs are safe to share and to
// index. The path mirrors the occurrenceId format (`${sourceId}:${date}`) split
// across two segments, avoiding a colon in the URL.
//
// Only paths from `generateStaticParams` exist — `dynamicParams = false` means an
// unknown id 404s instead of trying to render.
//
// Mirrored at `app/sv/event/[id]/[date]/page.tsx` (#260) — same data helpers,
// same `EventPermalinkArticle`, different `backHref` and canonical URL.

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
    alternates: { canonical: `/event/${id}/${date}` },
    openGraph: { title, description, url: `/event/${id}/${date}`, type: 'website' },
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
      <EventPermalinkArticle event={event} backHref="/" />
    </div>
  );
}
