'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Music, Disc, Ticket, Moon, GraduationCap, Banknote } from 'lucide-react';
import { SwingEvent } from '@/types/event';
import { FloorTypeBadge } from '@/components/FloorTypeBadge';
import { getTemporalBadge, formatEventDateRange, formatEventDateShort, TemporalBadge } from '@/lib/datetime';
import { ShareButton } from '@/components/ShareButton';
import { AddToCalendarButton } from '@/components/AddToCalendarButton';

interface EventCardProps {
  event: SwingEvent;
  /** All dates covered by this card (ascending). Length > 1 means multi-night. */
  dates: string[];
  /** Number of nights remaining in the expansion (1 for single-night cards). */
  nightCount: number;
  isThisWeek: boolean;
  showDate?: boolean;
  currentDate: string;
  currentTime: string;
}

function TemporalBadgeDisplay({ badge }: { badge: TemporalBadge }) {
  if (!badge) return null;

  switch (badge) {
    case 'happening-now':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-600 text-white text-[11px] uppercase font-bold tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          Happening Now
        </span>
      );
    case 'ended':
      return (
        <span className="px-2.5 py-0.5 rounded bg-zinc-200 text-zinc-600 text-[11px] uppercase font-bold tracking-wider border border-zinc-400">
          Ended
        </span>
      );
    case 'tonight':
      return (
        <span className="px-2.5 py-0.5 rounded bg-[var(--primary)] text-[var(--on-primary)] text-[11px] uppercase font-bold tracking-wider">
          Tonight
        </span>
      );
    case 'tomorrow':
      return (
        <span className="px-2.5 py-0.5 rounded bg-[var(--secondary)] text-[var(--on-secondary)] text-[11px] uppercase font-bold tracking-wider">
          Tomorrow
        </span>
      );
    case 'this-week':
      return (
        <span className="px-2.5 py-0.5 rounded bg-[var(--primary)]/15 text-[var(--primary)] text-[11px] uppercase font-bold tracking-wider border border-[var(--primary)]/20">
          This Week
        </span>
      );
    default:
      return null;
  }
}

export function EventCard({ event, dates, nightCount, isThisWeek, showDate, currentDate, currentTime }: EventCardProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionTruncated, setDescriptionTruncated] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  // Stable id linking the "Read more" toggle to the paragraph it expands.
  // event.id is an occurrenceId (`sourceId:date`); sanitise the colon so it's
  // a valid HTML id / IDREF.
  const descriptionId = `event-desc-${event.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el || descriptionExpanded) return;
    setDescriptionTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [event.body, descriptionExpanded]);

  const badge = getTemporalBadge(
    event.date,
    event.start,
    event.end,
    currentDate,
    currentTime,
    isThisWeek
  );

  const getStyleLabel = (style: string) => {
    switch (style.toLowerCase()) {
      case 'lindy':
        return 'Lindy Hop';
      case 'balboa':
        return 'Balboa';
      case 'blues':
        return 'Blues';
      case 'all':
        return 'Social – all styles';
      default:
        return style.charAt(0).toUpperCase() + style.slice(1);
    }
  };

  const getStyleColor = (style: string) => {
    switch (style.toLowerCase()) {
      case 'lindy':
        return 'bg-[var(--tertiary)]/10 text-[var(--tertiary)] border-[var(--tertiary)]/20';
      case 'balboa':
        return 'bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20';
      case 'blues':
        return 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]';
      default:
        return 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] border-[var(--surface-container-highest)]';
    }
  };

  const getStripeColor = () => {
    switch (badge) {
      case 'happening-now':
        return 'bg-red-600';
      case 'ended':
        return 'bg-zinc-300';
      case 'tonight':
        return 'bg-[var(--primary)]';
      case 'tomorrow':
        return 'bg-[var(--secondary)]';
      default:
        return isThisWeek ? 'bg-[var(--primary)]' : '';
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.address}`)}`;

  const priceDisplay = event.price ?? null;

  const musicRows: { type: 'live' | 'dj'; name?: string }[] = [];
  if (event.band) musicRows.push({ type: 'live', name: event.band });
  if (event.dj) musicRows.push({ type: 'dj', name: event.dj });
  if (musicRows.length === 0) {
    if (event.music === 'live') musicRows.push({ type: 'live' });
    else if (event.music === 'dj') musicRows.push({ type: 'dj' });
    else if (event.music === 'mixed') musicRows.push({ type: 'live' }, { type: 'dj' });
  }

  return (
    <div
      className={`relative lift-card rounded border-2 overflow-hidden flex flex-col text-[var(--on-surface)] ${event.cancelled ? 'border-red-400 bg-red-50/40' : badge === 'ended' ? 'border-zinc-300 bg-zinc-50' : 'border-[var(--on-surface)] bg-[var(--surface-container-low)]'} ${!event.cancelled && badge === 'happening-now' ? 'ring-2 ring-red-500/30' : ''}`}
    >
      {/* Highlighting border/accent stripe — red for cancelled, temporal colour otherwise */}
      {event.cancelled ? (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
      ) : (isThisWeek || badge) && (
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${getStripeColor()}`} />
      )}

      {/* Cancelled / ended cards are de-emphasised via border, background tint,
          stripe, badge and (for cancelled) strikethrough — not opacity, which
          would drag all descendant text below the WCAG AA contrast threshold. */}
      <div>
        <div className="p-5">
          {/* Time + temporal status */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              {(nightCount > 1 || showDate) && (
                <div className="font-sans text-xs text-[var(--on-surface-variant)] mb-0.5 font-medium">
                  {nightCount > 1
                    ? formatEventDateRange(dates[0], dates[dates.length - 1])
                    : formatEventDateShort(dates[0])}
                </div>
              )}
              <span className={`font-sans font-bold text-base tabular-nums tracking-tight text-[var(--on-surface)] ${event.cancelled ? 'line-through' : ''}`}>
                {event.start} – {event.end}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {event.cancelled && (
                <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] uppercase font-bold tracking-wider">
                  Cancelled
                </span>
              )}
              {event.status === 'draft' && (
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 text-[10px] uppercase font-bold tracking-wider">
                  Draft Preview
                </span>
              )}
              {!event.cancelled && <TemporalBadgeDisplay badge={badge} />}
            </div>
          </div>

          {/* Title */}
          <h3
            title={event.title}
            className={`font-serif text-xl font-bold tracking-tight text-[var(--on-surface)] leading-snug mb-1.5 truncate ${event.cancelled ? 'line-through' : ''}`}
          >
            {event.title}
          </h3>

          {/* Facts: venue, performers, price/payment — one consistent icon+text list */}
          <div className="space-y-3 font-sans text-sm mb-4">
            <div className="flex items-center gap-2 leading-none">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[var(--on-surface-variant)]" aria-hidden="true" />
              <span>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-bold text-[var(--on-surface)] underline decoration-[var(--outline)] underline-offset-4 hover:text-[var(--primary)] transition-colors ${event.cancelled ? 'line-through' : ''}`}
                >
                  {event.venue}
                </a>
                {event.neighborhood && (
                  <span className="text-[var(--on-surface-variant)]"> · {event.neighborhood}</span>
                )}
              </span>
            </div>

            {musicRows.map((row) => (
              <div key={row.type} className="flex items-center gap-2 leading-none text-[var(--on-surface-variant)]">
                {row.type === 'live' ? <Music className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> : <Disc className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                <span>
                  <span className="sr-only">{row.type === 'live' ? 'Live: ' : 'DJ: '}</span>
                  {row.name ?? (row.type === 'live' ? 'Live music' : 'DJ set')}
                </span>
              </div>
            ))}

            {(priceDisplay || event.payment) && (
              <div className="flex items-center gap-2 leading-none text-[var(--on-surface-variant)]">
                <Banknote className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {priceDisplay}
                  {priceDisplay && event.payment && ' · '}
                  {event.payment}
                </span>
              </div>
            )}
          </div>

          {/* Identity chips: style, floor, beginner, multi-night */}
          <div className="flex flex-wrap items-center gap-2 font-sans">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStyleColor(event.style)}`}>
              {getStyleLabel(event.style)}
            </span>
            <FloorTypeBadge floorType={event.floorType} />
            {nightCount > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap shrink-0">
                <Moon className="w-3 h-3" />
                {nightCount} nights
              </span>
            )}
            {event.beginnerClass && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-green-50 text-green-800 border border-green-200 text-[10px] uppercase font-bold tracking-wider">
                <GraduationCap className="w-3 h-3" />
                {event.beginnerClass.toLowerCase() === 'yes'
                  ? 'Beginner friendly'
                  : `Beginner class ${event.beginnerClass}`}
              </span>
            )}
          </div>
        </div>

        <div className="border-t-2 border-[var(--on-surface)] p-5 space-y-3 font-sans">
          {/* Description */}
          {event.body && (
            <div>
              <p
                ref={descriptionRef}
                id={descriptionId}
                className={`text-sm text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line ${descriptionExpanded ? '' : 'line-clamp-2'}`}
              >
                {event.body}
              </p>
              {descriptionTruncated && (
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded((v) => !v)}
                  aria-expanded={descriptionExpanded}
                  aria-controls={descriptionId}
                  className="mt-1 font-sans text-xs font-bold uppercase tracking-wider text-[var(--primary)] hover:underline"
                >
                  {descriptionExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {event.ticket && (
              <a
                href={event.ticket}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[var(--on-surface)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary"
              >
                <Ticket className="w-4 h-4" />
                Tickets / Info
              </a>
            )}
            <AddToCalendarButton event={event} />
            <ShareButton eventId={event.id} eventDate={event.date} eventTitle={event.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
