// Statically-generated event permalink. URL structure:
//   /event/[series-or-oneoff-id]/[YYYY-MM-DD]
//
// IDs are immutable per DATA.md — safe to use in persistent URLs. The path
// mirrors the occurrenceId format (`${sourceId}:${date}`), split across two
// segments for readability and to avoid colon-in-URL issues.
//
// JSON-LD (issue #10) and add-to-calendar (issue #9) will plug into this page;
// keep the event data easily accessible via the exported props.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Music, Disc, Ticket, Banknote, GraduationCap } from 'lucide-react';
import { getPermalinkEvents } from '@/lib/events';
import { formatEventDate } from '@/lib/datetime';
import type { Metadata } from 'next';
import type { SwingEvent } from '@/types/event';

// Reject any path not produced by generateStaticParams — no dynamic fallback.
export const dynamicParams = false;

export async function generateStaticParams() {
  const events = await getPermalinkEvents();
  return events.map((event) => ({
    // occurrenceId is `${sourceId}:${date}`; split into the two route segments.
    id: event.id.split(':')[0],
    date: event.date,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; date: string }>;
}): Promise<Metadata> {
  const { id, date } = await params;
  const events = await getPermalinkEvents();
  const event = events.find(
    (e) => e.id.split(':')[0] === id && e.date === date
  );
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
    openGraph: {
      title,
      description,
      url: `/event/${id}/${date}`,
      type: 'website',
    },
  };
}

function StyleBadge({ style }: { style: string }) {
  const label = (() => {
    switch (style.toLowerCase()) {
      case 'lindy': return 'Lindy Hop';
      case 'balboa': return 'Balboa';
      case 'blues': return 'Blues';
      case 'all': return 'Social – all styles';
      default: return style.charAt(0).toUpperCase() + style.slice(1);
    }
  })();

  const color = (() => {
    switch (style.toLowerCase()) {
      case 'lindy': return 'bg-[var(--tertiary)]/10 text-[var(--tertiary)] border-[var(--tertiary)]/20';
      case 'balboa': return 'bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20';
      case 'blues': return 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]';
      default: return 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] border-[var(--surface-container-highest)]';
    }
  })();

  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${color}`}>
      {label}
    </span>
  );
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string; date: string }>;
}) {
  const { id, date } = await params;
  const events = await getPermalinkEvents();
  const event: SwingEvent | undefined = events.find(
    (e) => e.id.split(':')[0] === id && e.date === date
  );
  if (!event) notFound();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.address}`)}`;

  const musicRows: { type: 'live' | 'dj'; name?: string }[] = [];
  if (event.band) musicRows.push({ type: 'live', name: event.band });
  if (event.dj) musicRows.push({ type: 'dj', name: event.dj });
  if (musicRows.length === 0) {
    if (event.music === 'live') musicRows.push({ type: 'live' });
    else if (event.music === 'dj') musicRows.push({ type: 'dj' });
    else if (event.music === 'mixed') musicRows.push({ type: 'live' }, { type: 'dj' });
  }

  const priceDisplay = event.price
    ? `${event.price}${event.payment ? ` (${event.payment})` : ''}`
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Back navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors mb-6 font-sans"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All events
      </Link>

      {/* Event card */}
      <article className="border-2 border-[var(--on-surface)] bg-[var(--surface-container-low)] rounded overflow-hidden">
        <div className="p-6 space-y-5">
          {/* Date */}
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
            {formatEventDate(event.date)}
          </p>

          {/* Title */}
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--on-surface)] leading-snug">
            {event.title}
          </h1>

          {/* Time */}
          <p className="font-sans font-bold text-lg tabular-nums tracking-tight text-[var(--on-surface)]">
            {event.start} – {event.end}
          </p>

          {/* Venue */}
          <div className="text-sm">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[var(--on-surface)] underline decoration-[var(--outline)] underline-offset-4 hover:text-[var(--primary)] transition-colors"
            >
              {event.venue}
            </a>
            {event.neighborhood && (
              <span className="text-[var(--outline)]"> · {event.neighborhood}</span>
            )}
          </div>

          {/* Style / beginner / price badges */}
          <div className="flex flex-wrap items-center gap-2 font-sans">
            <StyleBadge style={event.style} />
            {event.beginnerClass && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-green-50 text-green-800 border border-green-200 text-[10px] uppercase font-bold tracking-wider">
                <GraduationCap className="w-3 h-3" />
                {event.beginnerClass.toLowerCase() === 'yes'
                  ? 'Beginner friendly'
                  : `Beginner class ${event.beginnerClass}`}
              </span>
            )}
            {priceDisplay && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[var(--surface-container)] text-[var(--on-surface-variant)] border border-[var(--surface-container-highest)] text-[11px] font-bold uppercase tracking-wider">
                <Banknote className="w-3.5 h-3.5" />
                {priceDisplay}
              </span>
            )}
          </div>

          {/* Music rows */}
          {musicRows.length > 0 && (
            <div className="space-y-1.5 font-sans">
              {musicRows.map((row) => (
                <div key={row.type} className="flex items-center gap-2 min-w-0">
                  {row.type === 'live' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border bg-amber-50 text-amber-800 border-amber-200 whitespace-nowrap shrink-0">
                      <Music className="w-3 h-3" />
                      Live Music
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border bg-[var(--surface-container)] text-[var(--on-surface-variant)] border-[var(--surface-container-highest)] whitespace-nowrap shrink-0">
                      <Disc className="w-3 h-3" />
                      DJ
                    </span>
                  )}
                  {row.name && (
                    <span className="text-sm text-[var(--outline)] font-medium">
                      {row.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Organizer + address */}
          {(event.organizer || event.address) && (
            <div className="flex items-start gap-2 text-xs text-[var(--outline)] font-medium font-sans">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                {[event.organizer && `By ${event.organizer}`, event.address]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
          )}

          {/* Description */}
          {event.body && (
            <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line">
              {event.body}
            </p>
          )}

          {/* Ticket CTA */}
          {event.ticket && (
            <a
              href={event.ticket}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[var(--on-surface)] bg-[var(--primary)] text-white hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary"
            >
              <Ticket className="w-4 h-4" />
              Get Tickets / Info
            </a>
          )}
        </div>
      </article>
    </div>
  );
}
