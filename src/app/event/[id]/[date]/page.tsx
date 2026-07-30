// Statically-generated event permalink: `/event/[series-or-oneoff-id]/[YYYY-MM-DD]`.
//
// IDs are immutable per docs/DATA.md, so these URLs are safe to share and to
// index. The path mirrors the occurrenceId format (`${sourceId}:${date}`) split
// across two segments, avoiding a colon in the URL.
//
// Only paths from `generateStaticParams` exist — `dynamicParams = false` means an
// unknown id 404s instead of trying to render.

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { formatEventDate } from '@/lib/date/format';
import { EventPermalink } from '@/features/events/components/EventPermalink';
import { singleEventJsonLd } from '@/features/events/jsonld';
import { getPermalinkEvents } from '@/features/events/loader';
import type { SwingEvent } from '@/features/events/model/event';

export const dynamicParams = false;

/** The route's two segments identify one occurrence; find the one they name. */
async function findEvent(id: string, date: string): Promise<SwingEvent | undefined> {
  const events = await getPermalinkEvents();
  return events.find((event) => event.sourceId === id && event.date === date);
}

export async function generateStaticParams() {
  const events = await getPermalinkEvents();
  return events.map((event) => ({ id: event.sourceId, date: event.date }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; date: string }>;
}): Promise<Metadata> {
  const { id, date } = await params;
  const event = await findEvent(id, date);
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
  const event = await findEvent(id, date);
  if (!event) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: singleEventJsonLd(event) }}
      />
      <EventPermalink event={event} />
    </div>
  );
}
