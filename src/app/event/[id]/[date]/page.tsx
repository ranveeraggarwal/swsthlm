// Statically-generated event permalink: `/event/[series-or-oneoff-id]/[YYYY-MM-DD]`.
//
// IDs are immutable per docs/DATA.md, so these URLs are safe to share and to
// index. The path mirrors the occurrenceId format (`${sourceId}:${date}`) split
// across two segments, avoiding a colon in the URL.
//
// Only paths from `generateStaticParams` exist — `dynamicParams = false` means an
// unknown id 404s instead of trying to render.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Ticket } from 'lucide-react';
import { formatEventDate } from '@/lib/date/format';
import { ReportCorrectionButton } from '@/features/corrections/ReportCorrectionButton';
import { AddToCalendarButton } from '@/features/events/components/AddToCalendarButton';
import { BeginnerChip, StyleChip } from '@/features/events/components/EventChips';
import { EventFacts } from '@/features/events/components/EventFacts';
import { FloorTypeBadge } from '@/features/events/components/FloorTypeBadge';
import { ShareButton } from '@/features/events/components/ShareButton';
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

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors mb-6 font-sans"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All events
      </Link>

      <article className="border-2 border-[var(--border-ink)] bg-[var(--surface-container-low)] rounded overflow-hidden">
        <div className="p-6 space-y-5">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
            {formatEventDate(event.date)}
          </p>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--on-surface)] leading-snug">
            {event.title}
          </h1>

          <p className="font-sans font-bold text-lg tabular-nums tracking-tight text-[var(--on-surface)]">
            {event.start} – {event.end}
          </p>

          <EventFacts event={event} />

          <div className="flex flex-wrap items-center gap-2 font-sans">
            <StyleChip style={event.style} layout="permalink" />
            <FloorTypeBadge floorType={event.floorType} />
            <BeginnerChip beginnerClass={event.beginnerClass} />
          </div>

          {event.body && (
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line">
              {event.body}
            </p>
          )}

          {event.ticket && (
            <a
              href={event.ticket}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary"
            >
              <Ticket className="w-4 h-4" />
              Source
              <span className="sr-only"> — tickets and event info (opens in a new tab)</span>
            </a>
          )}
        </div>
      </article>

      <div className="flex items-center gap-2 mt-4">
        <AddToCalendarButton event={event} />
        <ShareButton event={event} />
        <ReportCorrectionButton event={event} />
      </div>
    </div>
  );
}
