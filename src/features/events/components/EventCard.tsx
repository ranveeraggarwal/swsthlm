'use client';

// The full event card, used in the highlighted grid at the top of the homepage.
// `EventRow` is the compact form for events further out.
//
// It opens with a header band drawn as the night's music — a ticket stub for a
// live band, a record sleeve for a DJ set — which carries the time and the
// badges; see `EventCardHeader`.
//
// Cancelled and ended cards are de-emphasised with border, background tint,
// stripe, badge and (for cancelled) strikethrough — deliberately *not* opacity,
// which would drag all the descendant text below the WCAG AA contrast threshold.

import React, { useEffect, useRef, useState } from 'react';
import { Ticket } from 'lucide-react';
import type { Now } from '@/lib/date/clock';
import { ReportCorrectionButton } from '@/features/corrections/ReportCorrectionButton';
import { domIdFor, type EventGroup } from '../model/event';
import { getTemporalBadge } from '../model/temporal';
import { useLocale } from '@/components/providers/LocaleProvider';
import { AddToCalendarButton } from './AddToCalendarButton';
import { EventCardHeader } from './EventCardHeader';
import { BeginnerChip, NightsChip, StyleChip, TasterClassChip } from './EventChips';
import { EventFacts } from './EventFacts';
import { FloorTypeBadge } from './FloorTypeBadge';
import { ShareButton } from './ShareButton';
import { badgeStripeClass } from './TemporalBadgeDisplay';

interface EventCardProps {
  group: EventGroup;
  /** Drives the "This Week" badge, and the accent stripe when no other badge applies. */
  isThisWeek: boolean;
  /** Force the date line on, for a card whose section heading doesn't carry it. */
  showDate?: boolean;
  now: Now;
}

/** How many lines of the organizer's description to show before "Read more". */
const DESCRIPTION_CLAMP = 'line-clamp-2';

export function EventCard({ group, isThisWeek, showDate, now }: EventCardProps) {
  const { bundle } = useLocale();
  const { event, dates, nightCount } = group;

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionTruncated, setDescriptionTruncated] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const descriptionId = domIdFor(event, 'event-desc');

  // "Read more" only appears if the text is actually clipped, which can only be
  // measured after layout.
  useEffect(() => {
    const el = descriptionRef.current;
    if (!el || descriptionExpanded) return;
    setDescriptionTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [event.body, descriptionExpanded]);

  const badge = getTemporalBadge(event, now, isThisWeek);

  return (
    // A one-column grid so the header's notches can share the band's cell, and
    // no `overflow-hidden`, so they can paint over this card's own border.
    <div
      className={`relative lift-card rounded border-2 grid grid-cols-1 text-[var(--on-surface)] ${
        event.cancelled
          ? 'border-[var(--error)]/50 bg-[var(--error-container)]/40'
          : badge === 'ended'
            ? 'border-[var(--ended-surface-outline)] bg-[var(--ended-surface)]'
            : 'border-[var(--border-ink)] bg-[var(--surface-container-low)]'
      } ${!event.cancelled && badge === 'happening-now' ? 'ring-2 ring-[var(--live)]/30' : ''}`}
    >
      {/* Accent stripe — red for cancelled, temporal colour otherwise. Rounded
          itself, as the card no longer clips its corners. */}
      {event.cancelled ? (
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-sm bg-[var(--error)]" />
      ) : (
        (isThisWeek || badge) && (
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-sm ${badgeStripeClass(badge, isThisWeek)}`}
          />
        )
      )}

      <EventCardHeader group={group} badge={badge} showDate={showDate} />

      <div className="p-5">
        <h3
          title={event.title}
          className={`font-serif text-xl font-bold tracking-tight text-[var(--on-surface)] leading-snug mb-1.5 truncate ${event.cancelled ? 'line-through' : ''}`}
        >
          {event.title}
        </h3>

        {/* The header band already says whether it's a band or a DJ, so
            only a performer's name earns a line here. */}
        <EventFacts
          event={event}
          struckThrough={event.cancelled}
          namedPerformersOnly
          className="mb-4"
        />

        <div className="flex flex-wrap items-center gap-2 font-sans">
          <StyleChip style={event.style} layout="card" />
          <FloorTypeBadge floorType={event.floorType} />
          <NightsChip nightCount={nightCount} />
          <BeginnerChip beginnerClass={event.beginnerClass} />
          <TasterClassChip tasterClass={event.tasterClass} />
        </div>
      </div>

      <div className="border-t-2 border-[var(--border-ink)] p-5 space-y-3 font-sans">
        {event.body && (
          <div>
            <p
              ref={descriptionRef}
              id={descriptionId}
              className={`text-sm text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line ${descriptionExpanded ? '' : DESCRIPTION_CLAMP}`}
            >
              {event.body}
            </p>
            {descriptionTruncated && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((v) => !v)}
                aria-expanded={descriptionExpanded}
                aria-controls={descriptionId}
                className="mt-1 font-sans text-xs font-bold uppercase tracking-wider text-[var(--primary)] hover:underline transition-colors cursor-pointer"
              >
                {descriptionExpanded ? bundle.card.showLess : bundle.card.readMore}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {event.ticket && (
            <a
              href={event.ticket}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[var(--border-ink)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary"
            >
              <Ticket aria-hidden="true" className="w-4 h-4" />
              {bundle.card.source}
              <span className="sr-only">{bundle.card.opensInNewTab}</span>
            </a>
          )}
          <AddToCalendarButton event={event} />
          <ShareButton event={event} />
          <ReportCorrectionButton event={event} dates={dates} />
        </div>
      </div>
    </div>
  );
}
